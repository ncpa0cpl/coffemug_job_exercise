declare module "@brixtol/country-continent" {
  import { AnyCase, LiteralUnion } from "@brixtol/tsutils";
  export interface IContinentNames {
    EU: "Europe";
    AS: "Asia";
    NA: "North America";
    SA: "South America";
    OC: "Oceania";
    AF: "Africa";
  }
  export interface IContinents {
    /** Andorra */
    AD: "EU";
    /** United Arab Emirates */
    AE: "AS";
    /** Afghanistan */
    AF: "AS";
    /** Antigua and Barbuda */
    AG: "NA";
    /** Anguilla */
    AI: "NA";
    /** Albania */
    AL: "EU";
    /** Armenia */
    AM: "AS";
    /** Angola */
    AO: "AF";
    /** Antarctica */
    AQ: "AN";
    /** Argentina */
    AR: "SA";
    /** American Samoa */
    AS: "OC";
    /** Austria */
    AT: "EU";
    /** Australia */
    AU: "OC";
    /** Aruba */
    AW: "NA";
    /** Åland Islands */
    AX: "EU";
    /** Azerbaijan */
    AZ: "AS";
    /** Bosnia and Herzegovina */
    BA: "EU";
    /** Barbados */
    BB: "NA";
    /** Bangladesh */
    BD: "AS";
    /** Belgium */
    BE: "EU";
    /** Burkina Faso */
    BF: "AF";
    /** Bulgaria */
    BG: "EU";
    /** Bahrain */
    BH: "AS";
    /** Burundi */
    BI: "AF";
    /** Benin */
    BJ: "AF";
    /** Saint Barthélemy */
    BL: "NA";
    /** Bermuda */
    BM: "NA";
    /** Brunei Darussalam */
    BN: "AS";
    /** Bolivia (Plurinational State of) */
    BO: "SA";
    /** Bonaire, Sint Eustatius and Saba */
    BQ: "NA";
    /** Brazil */
    BR: "SA";
    /** Bahamas */
    BS: "NA";
    /** Bhutan */
    BT: "AS";
    /** Bouvet Island */
    BV: "AN";
    /** Botswana */
    BW: "AF";
    /** Belarus */
    BY: "EU";
    /** Belize */
    BZ: "NA";
    /** Canada */
    CA: "NA";
    /** Cocos (Keeling) Islands */
    CC: "AS";
    /** Congo, Democratic Republic of the */
    CD: "AF";
    /** Central African Republic */
    CF: "AF";
    /** Congo, Republic of the */
    CG: "AF";
    /** Switzerland */
    CH: "EU";
    /** Côte d'Ivoire */
    CI: "AF";
    /** Cook Islands */
    CK: "OC";
    /** Chile */
    CL: "SA";
    /** Cameroon */
    CM: "AF";
    /** China */
    CN: "AS";
    /** Colombia */
    CO: "SA";
    /** Costa Rica */
    CR: "NA";
    /** Cuba */
    CU: "NA";
    /** Cabo Verde */
    CV: "AF";
    /** Curaçao */
    CW: "NA";
    /** Christmas Island */
    CX: "AS";
    /** Cyprus */
    CY: "EU";
    /** Czech Republic */
    CZ: "EU";
    /** Germany */
    DE: "EU";
    /** Djibouti */
    DJ: "AF";
    /** Denmark */
    DK: "EU";
    /** Dominica */
    DM: "NA";
    /** Dominican Republic */
    DO: "NA";
    /** Algeria */
    DZ: "AF";
    /** Ecuador */
    EC: "SA";
    /** Estonia */
    EE: "EU";
    /** Egypt */
    EG: "AF";
    /** Western Sahara */
    EH: "AF";
    /** Eritrea */
    ER: "AF";
    /** Spain */
    ES: "EU";
    /** Ethiopia */
    ET: "AF";
    /** Finland */
    FI: "EU";
    /** Fiji */
    FJ: "OC";
    /** Falkland Islands (Malvinas) */
    FK: "SA";
    /** Micronesia (Federated States of) */
    FM: "OC";
    /** Faroe Islands */
    FO: "EU";
    /** France */
    FR: "EU";
    /** Gabon */
    GA: "AF";
    /** United Kingdom of Great Britain and Northern Ireland */
    GB: "EU";
    /** Grenada */
    GD: "NA";
    /** Georgia */
    GE: "AS";
    /** French Guiana */
    GF: "SA";
    /** Guernsey */
    GG: "EU";
    /** Ghana */
    GH: "AF";
    /** Gibraltar */
    GI: "EU";
    /** Greenland */
    GL: "NA";
    /** Gambia */
    GM: "AF";
    /** Guinea */
    GN: "AF";
    /** Guadeloupe */
    GP: "NA";
    /** Equatorial Guinea */
    GQ: "AF";
    /** Greece */
    GR: "EU";
    /** South Georgia and the South Sandwich Islands */
    GS: "AN";
    /** Guatemala */
    GT: "NA";
    /** Guam */
    GU: "OC";
    /** Guinea-Bissau */
    GW: "AF";
    /** Guyana */
    GY: "SA";
    /** Hong Kong */
    HK: "AS";
    /** Heard Island and McDonald Islands */
    HM: "AN";
    /** Honduras */
    HN: "NA";
    /** Croatia */
    HR: "EU";
    /** Haiti */
    HT: "NA";
    /** Hungary */
    HU: "EU";
    /** Indonesia */
    ID: "AS";
    /** Ireland */
    IE: "EU";
    /** Israel */
    IL: "AS";
    /** Isle Of Man  */
    IM: "EU";
    /** India (Indian Rupee) */
    IN: "AS";
    /** British Indian Ocean Territory */
    IO: "AS";
    /** Iraq */
    IQ: "AS";
    /** Iran Islamic Republic  */
    IR: "AS";
    /** Iceland */
    IS: "EU";
    /** Italy */
    IT: "EU";
    /** Jersey */
    JE: "EU";
    /** Jamaica */
    JM: "NA";
    /** Jordan */
    JO: "AS";
    /** Japan */
    JP: "AS";
    /** Kenya */
    KE: "AF";
    /** Kyrgyzstan */
    KG: "AS";
    /** Cambodia */
    KH: "AS";
    /** Kiribati */
    KI: "OC";
    /** Comoros */
    KM: "AF";
    /** Saint Kitts and Nevis */
    KN: "NA";
    /** North Korea */
    KP: "AS";
    /** South Korea */
    KR: "AS";
    /** Kuwait */
    KW: "AS";
    /** Cayman Islands */
    KY: "NA";
    /** Kazakhstan */
    KZ: "AS";
    /** Laos */
    LA: "AS";
    /** Lebanon */
    LB: "AS";
    /** Saint Lucia */
    LC: "NA";
    /** Liechtenstein */
    LI: "EU";
    /** Sri Lanka */
    LK: "AS";
    /** Liberia */
    LR: "AF";
    /** Lesotho */
    LS: "AF";
    /** Lithuania */
    LT: "EU";
    /** Luxembourg */
    LU: "EU";
    /** Latvia */
    LV: "EU";
    /** Libya */
    LY: "AF";
    /** Morocco */
    MA: "AF";
    /** Monaco */
    MC: "EU";
    /** Moldova, Republic of */
    MD: "EU";
    /** Montenegro */
    ME: "EU";
    /** Saint Martin (French part) */
    MF: "NA";
    /** Madagascar */
    MG: "AF";
    /** Marshall Islands */
    MH: "OC";
    /** Macedonia */
    MK: "EU";
    /** Mali */
    ML: "AF";
    /** Myanmar */
    MM: "AS";
    /** Mongolia */
    MN: "AS";
    /** Macao */
    MO: "AS";
    /** Northern Mariana Islands */
    MP: "OC";
    /** Martinique */
    MQ: "NA";
    /** Mauritania */
    MR: "AF";
    /** Montserrat */
    MS: "NA";
    /** Malta */
    MT: "EU";
    /** Mauritius */
    MU: "AF";
    /** Maldives */
    MV: "AS";
    /** Malawi */
    MW: "AF";
    /** Mexico */
    MX: "NA";
    /** Malaysia */
    MY: "AS";
    /** Mozambique */
    MZ: "AF";
    /** Namibia */
    NA: "AF";
    /** New Caledonia */
    NC: "OC";
    /** Niger */
    NE: "AF";
    /** Norfolk Island */
    NF: "OC";
    /** Nigeria */
    NG: "AF";
    /** Nicaragua */
    NI: "NA";
    /** Netherlands */
    NL: "EU";
    /** Norway */
    NO: "EU";
    /** Nepal */
    NP: "AS";
    /** Nauru */
    NR: "OC";
    /** Niue */
    NU: "OC";
    /** New Zealand */
    NZ: "OC";
    /** Oman */
    OM: "AS";
    /** Panama */
    PA: "NA";
    /** Peru */
    PE: "SA";
    /** French Polynesia */
    PF: "OC";
    /** Papua New Guinea */
    PG: "OC";
    /** Philippines */
    PH: "AS";
    /** Pakistan */
    PK: "AS";
    /** Poland */
    PL: "EU";
    /** Saint Pierre and Miquelon */
    PM: "NA";
    /** Pitcairn */
    PN: "OC";
    /** Puerto Rico */
    PR: "NA";
    /** Palestine */
    PS: "AS";
    /** Portugal  */
    PT: "EU";
    /** Palau */
    PW: "OC";
    /** Paraguay  */
    PY: "SA";
    /** Qatar */
    QA: "AS";
    /** Reunion */
    RE: "AF";
    /** Romania  */
    RO: "EU";
    /** Serbia  */
    RS: "EU";
    /** Russian Federation */
    RU: "EU";
    /** Rwanda */
    RW: "AF";
    /** Saudi Arabia */
    SA: "AS";
    /** Solomon Islands */
    SB: "OC";
    /** Seychelles */
    SC: "AF";
    /** Sudan */
    SD: "AF";
    /** Sweden */
    SE: "EU";
    /** Singapore */
    SG: "AS";
    /** Saint Helena Ascension And Tristan Da Cunha */
    SH: "AF";
    /** Slovenia */
    SI: "EU";
    /** Svalbard and Jan Mayen  */
    SJ: "EU";
    /** Slovakia  */
    SK: "EU";
    /** Sierra Leone  */
    SL: "AF";
    /** San Marino */
    SM: "EU";
    /** Senegal */
    SN: "AF";
    /** Somalia */
    SO: "AF";
    /** Suriname */
    SR: "SA";
    /** South Sudan */
    SS: "AF";
    /** Sao Tome And Principe */
    ST: "AF";
    /** El Salvador */
    SV: "NA";
    /** Sint Maarten */
    SX: "NA";
    /** Syrian Arab Republic  */
    SY: "AS";
    /** Swaziland */
    SZ: "AF";
    /** Turks and Caicos Islands */
    TC: "NA";
    /** Chad */
    TD: "AF";
    /** French Southern Territories */
    TF: "AN";
    /** Togo */
    TG: "AF";
    /** Thailand */
    TH: "AS";
    /** Tajikistan */
    TJ: "AS";
    /** Tokelau */
    TK: "OC";
    /** Timor Leste */
    TL: "OC";
    /** Turkmenistan */
    TM: "AS";
    /** Tunisia */
    TN: "AF";
    /** Tonga */
    TO: "OC";
    /** Turkey */
    TR: "AS";
    /** Trinidad and Tobago */
    TT: "NA";
    /** Tuvalu */
    TV: "OC";
    /** Taiwan */
    TW: "AS";
    /** Tanzania United Republic */
    TZ: "AF";
    /** Ukraine */
    UA: "EU";
    /** Uganda */
    UG: "AF";
    /** United States Minor Outlying Islands */
    UM: "OC";
    /** United States Of America */
    US: "NA";
    /** Uruguay */
    UY: "SA";
    /** Uzbekistan */
    UZ: "AS";
    /** Holy See */
    VA: "EU";
    /** Saint Vincent And The Grenadines */
    VC: "NA";
    /** Venezuela */
    VE: "SA";
    /** Virgin Islands (British) */
    VG: "NA";
    /** Virgin Islands (U.S.) */
    VI: "NA";
    /** Vietnam */
    VN: "AS";
    /** Vanuatu */
    VU: "OC";
    /** Wallis and Futuna */
    WF: "OC";
    /** Samoa */
    WS: "OC";
    /** Republic of Kosovo */
    XK: "EU";
    /** Yemen */
    YE: "AS";
    /** Mayotte */
    YT: "AF";
    /** South Africa */
    ZA: "AF";
    /** Zambia */
    ZM: "AF";
    /** Zimbabwe */
    ZW: "AF";
  }
  /**
   * Continent Code
   *
   * Extracts the countient code from the IContinents interface
   * which is use as the Return type reference
   */
  export declare type GetContinentCodes<ISO> = ISO extends keyof IContinents ? IContinents[ISO] : never;
  /**
   * Continent Name
   *
   * Extracts the countinent name using the continent code
   */
  export declare type ContinentName<Code> = Code extends keyof IContinentNames ? IContinentNames[Code] : never;
  /**
   * Continent Codes Map
   *
   * Country code (ISO 3166-1 alpha-2) to continent code
   * **Readonly** object.
   */
  export declare const ContinentCodes: Readonly<IContinents>;
  /**
   * Continent Names Map
   *
   * Continent codes to continent name (in English)
   * **Readonly** object.
   */
  export declare const ContinentNames: Readonly<IContinentNames>;
  /**
   * Get Continent Code
   *
   * Requires a 2 Letter (ISO 3166-1 alpha-2) country
   * code to be passed and returns a 2 letter continent code.
   *
   * > _Accepts either uppercase, lowercase or
   * or a combination of either_
   */
  export declare function getContinentCode<ISO extends AnyCase<keyof IContinents>>(
    code: LiteralUnion<ISO>,
  ): GetContinentCodes<Uppercase<ISO>>;
  /**
   * Get Continent Name
   *
   * Requires a 2 Letter (ISO 3166-1 alpha-2) country
   * code to be passed and returns a 2 letter continent code.
   *
   * > _Accepts either uppercase, lowercase or
   * or a combination of either_
   */
  export declare function getContinentName<ISO extends AnyCase<keyof IContinents>>(
    code: LiteralUnion<ISO>,
  ): ContinentName<GetContinentCodes<Uppercase<ISO>>>;
}
