# Assumptions & Simplifications
1. Aside from the objects mentioned in the exercise description that should be persistent (products and orders), there should be other things that need to be persisted in the DB as well: customers, discounts, taxes
2. The exercise requires support for volume based discounts, date based discounts and some special case price adjustments (location pricing, VAT tax). I will separate these into three different mechanisms: discounts, taxes and location based prices.
      - discounts will be stored in DB, containing the information on the discount amount (% of the price), and the rules based on which the application will determine if it's applicable or not
      - taxes will also be stored in DB and used to fulfill the requirement of increased prices in Europe due to VAT, taxes will be calculated at the time of placing an order along with discounts
      - location based pricing - each product will have multiple prices instead of just one, each price can be targeting a specific region (Europe, Asia, Africa, North America), these prices would be created at the time when the products are created and stored in the DB alongside products. when order will be placed an appropriate price will be selected based on customer location and any taxes or discounts will be calculated on top of that price.
3. For volume based pricing it is assumed that the volume of the whole order is what determines if the discount applies or not, not the volume of specific items
4. POST endpoints will not require any form of authentication. In a real system all endpoint calls that modify the stored data should be authenticated and authorized to have the permission to perform the action, this will be omitted for simplicity.
5. In different countries taxes might be calculated differently (and discounts as well), (for example VAT in Poland is calculated per every item separately, while the Canadian GST would be calculated from the sum of all item prices that are applicable for this tax, and other countries could have different rules). For simplicity I will always use a calculation method where each product unit has it's taxes and discounts calculated separately.

# Technical Decisions

1. Database choice: SQLite (libsql)
   - file based, which allows for easy deployments, development and testing
   - can easily be later replaced with a more scalable SQL database like PostgreSQL or MySQL, or depending on future requirements libsql allows for remote SQLite access and database replication (essentially giving us more options to scale in the future)
   - relational, the data we will be storing is pretty much structured the same for all operations (no need for flexible schemas) and fits well with the relational model
   - SQL query language will allow us to avoid DB roundtrip by leveraging JOINS
   - SQLite gives us the ability to add constraints to specific columns to ensure things like product stock never going below zero
2. CQRS ans SQL Queries
   - all db operations are segregated into either a Command or a Query object, commands are located in `src/data/commands` and the queries in `src/data/queries`. Queries are meant for retrieving data, commands for writing to the DB.
   - all commands execute within a transaction on a separate DB connection which ensures the atomicity of each command
   - queries must contain exactly one SQL query and provide a model into which the results will be mapped to, it is possible to map joins but only up to 1 level deep, when the query object is passed to the query handler, the SQL statement will be executed and it's result will be mapped to the Query model - this mechanism allows for hand-crafting the queries while still having automatic mapping to objects similar to an ORM
3. Project structure
   - the source code of the app is located in the `src` directory, and the unit and integration tests in the `tests` dir. this separation is made to avoid accidentally importing any of the test code in the source
   - `src/data` - contains all the data access code. queries, commands and migrations
   - `src/lib` - contains the core logic of the program
   - `src/routes` - contains all the Express.js Routers and endpoint definitions
   - `src/utils` - contains small utility functions
   - `src/start.ts` - the entrypoint of the program, initializes and starts the server
   - this structure ensures a strong separation of concerns and also follows patterns often seen in software development, which makes it easier for anyone to quickly familiarize themselves with the project and how things work

# Business Logic

## Orders & Discounts

To calculate the Order following steps are taken:

1. Iterate over all known discounts, identify those that are applicable to the current order based on the discount rules (either the order volume is high enough or the date is within the discount date range), ignore those that are not applicable. Out of the applicable discounts select one with the highest `amount` (amount is a integer representing the discounted % amount).
2. Find a tax that is applicable based on the provided location.
3. Go through every product in the order and calculate it's subtotal, tax and discounted amount:  
    **discounted amount** = Round(*unit price* x *discount percentage*) x *unit quantity*  
    **tax subtotal** = Round(*unit price* x *tax percentage*) x *unit quantity*  
    **product subtotal** = *unit price* x *unit quantity*
4. To get the product total subtract the discounted amount from the subtotal and add the calculated tax.
5. Get the sum of all items to get the Order total.

A Banker Rounding mode (round half even) is used for calculating the discounts and taxes.  
Tax amounts are always calculated based on the product unit price before the discount is applied, so the tax amount will be the same with or without the discount.

## Stock discrepancy

It is ensured that the item stock never goes below zero, this is achieved on a few different levels:

1. When processing the Order and calculating all the totals, subtotals etc. the OrderProcessor will throw an error if it finds that the quantity of the order item is higher than the last known product stock
2. In the product update Command and in the Order create Command the current stock stock for each product is retrieved from the DB and validated right before updating it in the DB. Since this validation happens within a Command which are atomic it shouldn't be possible to run into a race condition issue with two different requests decreasing the stock amount at the same time.
3. Additionally the table schema has a CHECK constraint which would cause an SQL error if a stock were to be set lower than zero.

# Testing

## Unit Tests

At the moment only the database commands and queries are unit tested, the following one are tested specifically:

- create order command
- create product command
- update product command
- get order query

Each of the above commands/queries test checks if the appropriate changes are applied to the DB, gives the correct results and fails when it is expected with the correct errors.

## Integration Tests

Every endpoint exposed by the app has integration tests, specifically the following endpoints have integration tests:

- GET /products
- POST /products
- POST /products/:id/restock
- POST /products/:id/sell
- POST /order

Each integration test spins up the server as it would be in a real production environment and sends real http requests to it to validate the expected behavior.

Each integration test validates for both correct and incorrect requests to test for both happy paths and failure paths.

## Untested

In a real production ready application other parts of the codebase should be unit tested but are not right now:

- OrderProcessor - this is the class responsible for calculating the order totals, taxes, discounts, etc. Since the results of those calculations being correct would be of utmost priority in a real production deployment, this part should be thoroughly tested for correctness. Every possible combination of base prices, taxes, discounts should have it's own test suite to ensure the users don't accidentally lose or gain money due to calculation errors.

- Database utilities in the `src/lib` directory. All the commands and queries used in all the endpoint handlers rely on this code to interact with the database, there should be unit tests ensuring these all behave correctly and as expected without errors.

- Utility functions. Ideally the utility functions in the `src/utils` should also be tested for correctness and edge cases.

# Trade-offs and alternatives

Query builder - I have decided to use hand written queries for interacting with the DB since most of the queries I'd need to make were fairly simple. There was one instance where I regretted not having a more flexible way of constructing queries. In the create order command, I had to insert multiple rows of order products, but with a hand written queries it is not as straightforward to insert multiple rows within a single query dynamically. Perhaps a query builder like Kysely would have been a better solution overall.


MongoDB - I have alternatively considered using a document-based database instead of the SQLite. Mongo would also allow for a file-based store, that would be very easy to develop, test and deploy. However I ended up choosing SQLite in the end due to following reasons:

1. SQL relational model and query JOINS would allow for avoiding round-trips to the DB. For some of the object references I would either have to store duplicate of some of the records in the DB or do multiple round-trips to the DB to retrieve all the data needed. An example of where this affected the final program is the GetOrderByIDQuery, which fetches the order along with other data from other tables all in one query.
2. Flexible schemas - mongo unlike SQLite has flexible schemas, this is however a feature that doesn't give me any advantages as this project is not actually going to evolve in the future, although I have created a migration mechanism I only use it to create the initial tables in the `src/data/migrations/create_tables.ts` and never make any more changes beyond that.
3. SQLite provides strong schema constraints unlike Mongo:
  - many of the tables are referencing each other (Order -> customer, Order -> Order Product, Product -> Product Price etc.), with SQLite it's possible to create true Foreign Key constraints and avoid potential bugs caused by data inconsistency, like for example an Order Product referencing a Product that doesn't exists in the DB.
  - cross-field CHECK constraints are not possible in Mongo, tables I've created for product prices and discounts are using cross-field check constraints to ensure the records inserted into them are logically valid (date range fields must be populated if the discount type is 'date', and the minimum value must be populated if the type is 'volume'). MongoDB check constraints not only are way more limiting but can also be bypassed.
  - uniqueness, MongoDB can only ensure uniqueness on indexes, in practice it's very useful to add uniqueness constraints to some of the data. although not really used for anything, I've added a unique email address field to the customers table, since that's exactly how it would be expected to be in a real production service
