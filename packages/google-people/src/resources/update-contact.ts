// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIPromise } from "../core/api-promise";
import { APIResource } from "../core/resource";
import { RequestOptions } from "../internal/request-options";
import { path } from "../internal/utils/path";
import * as PeopleCreateContactAPI from "./people-create-contact";

export class UpdateContact extends APIResource {
  /**
   * Update contact data for an existing contact person. Any non-contact data will
   * not be modified. Any non-contact data in the person to update will be ignored.
   * All fields specified in the `update_mask` will be replaced. The server returns a
   * 400 error if `person.metadata.sources` is not specified for the contact to be
   * updated or if there is no contact source. The server returns a 400 error with
   * reason `"failedPrecondition"` if `person.metadata.sources.etag` is different
   * than the contact's etag, which indicates the contact has changed since its data
   * was read. Clients should get the latest person and merge their updates into the
   * latest person. The server returns a 400 error if `memberships` are being updated
   * and there are no contact group memberships specified on the person. The server
   * returns a 400 error if more than one field is specified on a field that is a
   * singleton for contact sources: _ biographies _ birthdays _ genders _ names
   * Mutate requests for the same user should be sent sequentially to avoid increased
   * latency and failures.
   */
  update(
    pathResourceName: string,
    params: UpdateContactUpdateParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<PeopleCreateContactAPI.PersonMerged> {
    const {
      $,
      access_token,
      alt,
      callback,
      fields,
      key,
      oauth_token,
      personFields,
      prettyPrint,
      quotaUser,
      sources,
      updatePersonFields,
      upload_protocol,
      uploadType,
      ...body
    } = params ?? {};
    return this._client.patch(path`/v1/${pathResourceName}:updateContact`, {
      query: {
        $,
        access_token,
        alt,
        callback,
        fields,
        key,
        oauth_token,
        personFields,
        prettyPrint,
        quotaUser,
        sources,
        updatePersonFields,
        upload_protocol,
        uploadType,
      },
      body,
      ...options,
    });
  }
}

export interface UpdateContactUpdateParams {
  /**
   * Query param:
   */
  $?: UpdateContactUpdateParams._;

  /**
   * Query param: OAuth access token.
   */
  access_token?: string;

  /**
   * Query param: Data format for response.
   */
  alt?: "json" | "media" | "proto";

  /**
   * Query param: JSONP
   */
  callback?: string;

  /**
   * Query param: Selector specifying which fields to include in a partial response.
   */
  fields?: string;

  /**
   * Query param: API key. Your API key identifies your project and provides you with
   * API access, quota, and reports. Required unless you provide an OAuth 2.0 token.
   */
  key?: string;

  /**
   * Query param: OAuth 2.0 token for the current user.
   */
  oauth_token?: string;

  /**
   * Query param: Optional. A field mask to restrict which fields on each person are
   * returned. Multiple fields can be specified by separating them with commas.
   * Defaults to all fields if not set. Valid values are: _ addresses _ ageRanges _
   * biographies _ birthdays _ calendarUrls _ clientData _ coverPhotos _
   * emailAddresses _ events _ externalIds _ genders _ imClients _ interests _
   * locales _ locations _ memberships _ metadata _ miscKeywords _ names _ nicknames
   * _ occupations _ organizations _ phoneNumbers _ photos _ relations _ sipAddresses
   * _ skills _ urls \* userDefined
   */
  personFields?: string;

  /**
   * Query param: Returns response with indentations and line breaks.
   */
  prettyPrint?: boolean;

  /**
   * Query param: Available to use for quota purposes for server-side applications.
   * Can be any arbitrary string assigned to a user, but should not exceed 40
   * characters.
   */
  quotaUser?: string;

  /**
   * Query param: Optional. A mask of what source types to return. Defaults to
   * READ_SOURCE_TYPE_CONTACT and READ_SOURCE_TYPE_PROFILE if not set.
   */
  sources?: Array<
    | "READ_SOURCE_TYPE_UNSPECIFIED"
    | "READ_SOURCE_TYPE_PROFILE"
    | "READ_SOURCE_TYPE_CONTACT"
    | "READ_SOURCE_TYPE_DOMAIN_CONTACT"
  >;

  /**
   * Query param: Required. A field mask to restrict which fields on the person are
   * updated. Multiple fields can be specified by separating them with commas. All
   * updated fields will be replaced. Valid values are: _ addresses _ biographies _
   * birthdays _ calendarUrls _ clientData _ emailAddresses _ events _ externalIds _
   * genders _ imClients _ interests _ locales _ locations _ memberships _
   * miscKeywords _ names _ nicknames _ occupations _ organizations _ phoneNumbers _
   * relations _ sipAddresses _ urls _ userDefined
   */
  updatePersonFields?: string;

  /**
   * Query param: Upload protocol for media (e.g. "raw", "multipart").
   */
  upload_protocol?: string;

  /**
   * Query param: Legacy upload protocol for media (e.g. "media", "multipart").
   */
  uploadType?: string;

  /**
   * Body param: The person's street addresses.
   */
  addresses?: Array<UpdateContactUpdateParams.Address>;

  /**
   * Body param: The person's biographies. This field is a singleton for contact
   * sources.
   */
  biographies?: Array<UpdateContactUpdateParams.Biography>;

  /**
   * Body param: The person's birthdays. This field is a singleton for contact
   * sources.
   */
  birthdays?: Array<UpdateContactUpdateParams.Birthday>;

  /**
   * @deprecated Body param: **DEPRECATED**: No data will be returned The person's
   * bragging rights.
   */
  braggingRights?: Array<UpdateContactUpdateParams.BraggingRight>;

  /**
   * Body param: The person's calendar URLs.
   */
  calendarUrls?: Array<UpdateContactUpdateParams.CalendarURL>;

  /**
   * Body param: The person's client data.
   */
  clientData?: Array<UpdateContactUpdateParams.ClientData>;

  /**
   * Body param: The person's email addresses. For `people.connections.list` and
   * `otherContacts.list` the number of email addresses is limited to 100. If a
   * Person has more email addresses the entire set can be obtained by calling
   * GetPeople.
   */
  emailAddresses?: Array<UpdateContactUpdateParams.EmailAddress>;

  /**
   * Body param: The [HTTP entity tag](https://en.wikipedia.org/wiki/HTTP_ETag) of
   * the resource. Used for web cache validation.
   */
  etag?: string;

  /**
   * Body param: The person's events.
   */
  events?: Array<UpdateContactUpdateParams.Event>;

  /**
   * Body param: The person's external IDs.
   */
  externalIds?: Array<UpdateContactUpdateParams.ExternalID>;

  /**
   * Body param: The person's file-ases.
   */
  fileAses?: Array<UpdateContactUpdateParams.FileAse>;

  /**
   * Body param: The person's genders. This field is a singleton for contact sources.
   */
  genders?: Array<UpdateContactUpdateParams.Gender>;

  /**
   * Body param: The person's instant messaging clients.
   */
  imClients?: Array<UpdateContactUpdateParams.ImClient>;

  /**
   * Body param: The person's interests.
   */
  interests?: Array<UpdateContactUpdateParams.Interest>;

  /**
   * Body param: The person's locale preferences.
   */
  locales?: Array<UpdateContactUpdateParams.Locale>;

  /**
   * Body param: The person's locations.
   */
  locations?: Array<UpdateContactUpdateParams.Location>;

  /**
   * Body param: The person's group memberships.
   */
  memberships?: Array<UpdateContactUpdateParams.Membership>;

  /**
   * Body param: The person's miscellaneous keywords.
   */
  miscKeywords?: Array<UpdateContactUpdateParams.MiscKeyword>;

  /**
   * Body param: The person's names. This field is a singleton for contact sources.
   */
  names?: Array<UpdateContactUpdateParams.Name>;

  /**
   * Body param: The person's nicknames.
   */
  nicknames?: Array<UpdateContactUpdateParams.Nickname>;

  /**
   * Body param: The person's occupations.
   */
  occupations?: Array<UpdateContactUpdateParams.Occupation>;

  /**
   * Body param: The person's past or current organizations.
   */
  organizations?: Array<UpdateContactUpdateParams.Organization>;

  /**
   * Body param: The person's phone numbers. For `people.connections.list` and
   * `otherContacts.list` the number of phone numbers is limited to 100. If a Person
   * has more phone numbers the entire set can be obtained by calling GetPeople.
   */
  phoneNumbers?: Array<UpdateContactUpdateParams.PhoneNumber>;

  /**
   * Body param: The person's relations.
   */
  relations?: Array<UpdateContactUpdateParams.Relation>;

  /**
   * @deprecated Body param: **DEPRECATED**: (Please use `person.locations` instead)
   * The person's residences.
   */
  residences?: Array<UpdateContactUpdateParams.Residence>;

  /**
   * Body param: The resource name for the person, assigned by the server. An ASCII
   * string in the form of `people/{person_id}`.
   */
  body_resourceName?: string;

  /**
   * Body param: The person's SIP addresses.
   */
  sipAddresses?: Array<UpdateContactUpdateParams.SipAddress>;

  /**
   * Body param: The person's skills.
   */
  skills?: Array<UpdateContactUpdateParams.Skill>;

  /**
   * Body param: The person's associated URLs.
   */
  urls?: Array<UpdateContactUpdateParams.URL>;

  /**
   * Body param: The person's user defined data.
   */
  userDefined?: Array<UpdateContactUpdateParams.UserDefined>;
}

export namespace UpdateContactUpdateParams {
  export interface _ {
    /**
     * V1 error format.
     */
    xgafv?: "1" | "2";
  }

  /**
   * A person's physical address. May be a P.O. box or street address. All fields are
   * optional.
   */
  export interface Address {
    /**
     * The city of the address.
     */
    city?: string;

    /**
     * The country of the address.
     */
    country?: string;

    /**
     * The [ISO 3166-1 alpha-2](http://www.iso.org/iso/country_codes.htm) country code
     * of the address.
     */
    countryCode?: string;

    /**
     * The extended address of the address; for example, the apartment number.
     */
    extendedAddress?: string;

    /**
     * The unstructured value of the address. If this is not set by the user it will be
     * automatically constructed from structured values.
     */
    formattedValue?: string;

    /**
     * Metadata about the address.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The P.O. box of the address.
     */
    poBox?: string;

    /**
     * The postal code of the address.
     */
    postalCode?: string;

    /**
     * The region of the address; for example, the state or province.
     */
    region?: string;

    /**
     * The street address.
     */
    streetAddress?: string;

    /**
     * The type of the address. The type can be custom or one of these predefined
     * values: _ `home` _ `work` \* `other`
     */
    type?: string;
  }

  /**
   * A person's short biography.
   */
  export interface Biography {
    /**
     * The content type of the biography.
     */
    contentType?: "CONTENT_TYPE_UNSPECIFIED" | "TEXT_PLAIN" | "TEXT_HTML";

    /**
     * Metadata about the biography.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The short biography.
     */
    value?: string;
  }

  /**
   * A person's birthday. At least one of the `date` and `text` fields are specified.
   * The `date` and `text` fields typically represent the same date, but are not
   * guaranteed to. Clients should always set the `date` field when mutating
   * birthdays.
   */
  export interface Birthday {
    /**
     * The structured date of the birthday.
     */
    date?: PeopleCreateContactAPI.Date;

    /**
     * Metadata about the birthday.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * @deprecated Prefer to use the `date` field if set. A free-form string
     * representing the user's birthday. This value is not validated.
     */
    text?: string;
  }

  /**
   * @deprecated **DEPRECATED**: No data will be returned A person's bragging rights.
   */
  export interface BraggingRight {
    /**
     * Metadata about the bragging rights.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The bragging rights; for example, `climbed mount everest`.
     */
    value?: string;
  }

  /**
   * A person's calendar URL.
   */
  export interface CalendarURL {
    /**
     * Metadata about the calendar URL.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The type of the calendar URL. The type can be custom or one of these predefined
     * values: _ `home` _ `freeBusy` \* `work`
     */
    type?: string;

    /**
     * The calendar URL.
     */
    url?: string;
  }

  /**
   * Arbitrary client data that is populated by clients. Duplicate keys and values
   * are allowed.
   */
  export interface ClientData {
    /**
     * The client specified key of the client data.
     */
    key?: string;

    /**
     * Metadata about the client data.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The client specified value of the client data.
     */
    value?: string;
  }

  /**
   * A person's email address.
   */
  export interface EmailAddress {
    /**
     * The display name of the email.
     */
    displayName?: string;

    /**
     * Metadata about the email address.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The type of the email address. The type can be custom or one of these predefined
     * values: _ `home` _ `work` \* `other`
     */
    type?: string;

    /**
     * The email address.
     */
    value?: string;
  }

  /**
   * An event related to the person.
   */
  export interface Event {
    /**
     * The date of the event.
     */
    date?: PeopleCreateContactAPI.Date;

    /**
     * Metadata about the event.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The type of the event. The type can be custom or one of these predefined values:
     * _ `anniversary` _ `other`
     */
    type?: string;
  }

  /**
   * An identifier from an external entity related to the person.
   */
  export interface ExternalID {
    /**
     * Metadata about the external ID.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The type of the external ID. The type can be custom or one of these predefined
     * values: _ `account` _ `customer` _ `loginId` _ `network` \* `organization`
     */
    type?: string;

    /**
     * The value of the external ID.
     */
    value?: string;
  }

  /**
   * The name that should be used to sort the person in a list.
   */
  export interface FileAse {
    /**
     * Metadata about the file-as.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The file-as value
     */
    value?: string;
  }

  /**
   * A person's gender.
   */
  export interface Gender {
    /**
     * Free form text field for pronouns that should be used to address the person.
     * Common values are: _ `he`/`him` _ `she`/`her` \* `they`/`them`
     */
    addressMeAs?: string;

    /**
     * Metadata about the gender.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The gender for the person. The gender can be custom or one of these predefined
     * values: _ `male` _ `female` \* `unspecified`
     */
    value?: string;
  }

  /**
   * A person's instant messaging client.
   */
  export interface ImClient {
    /**
     * Metadata about the IM client.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The protocol of the IM client. The protocol can be custom or one of these
     * predefined values: _ `aim` _ `msn` _ `yahoo` _ `skype` _ `qq` _ `googleTalk` _
     * `icq` _ `jabber` \* `netMeeting`
     */
    protocol?: string;

    /**
     * The type of the IM client. The type can be custom or one of these predefined
     * values: _ `home` _ `work` \* `other`
     */
    type?: string;

    /**
     * The user name used in the IM client.
     */
    username?: string;
  }

  /**
   * One of the person's interests.
   */
  export interface Interest {
    /**
     * Metadata about the interest.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The interest; for example, `stargazing`.
     */
    value?: string;
  }

  /**
   * A person's locale preference.
   */
  export interface Locale {
    /**
     * Metadata about the locale.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The well-formed [IETF BCP 47](https://tools.ietf.org/html/bcp47) language tag
     * representing the locale.
     */
    value?: string;
  }

  /**
   * A person's location.
   */
  export interface Location {
    /**
     * The building identifier.
     */
    buildingId?: string;

    /**
     * Whether the location is the current location.
     */
    current?: boolean;

    /**
     * The individual desk location.
     */
    deskCode?: string;

    /**
     * The floor name or number.
     */
    floor?: string;

    /**
     * The floor section in `floor_name`.
     */
    floorSection?: string;

    /**
     * Metadata about the location.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The type of the location. The type can be custom or one of these predefined
     * values: _ `desk` _ `grewUp`
     */
    type?: string;

    /**
     * The free-form value of the location.
     */
    value?: string;
  }

  /**
   * A person's membership in a group. Only contact group memberships can be
   * modified.
   */
  export interface Membership {
    /**
     * The contact group membership.
     */
    contactGroupMembership?: Membership.ContactGroupMembership;

    /**
     * Metadata about the membership.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;
  }

  export namespace Membership {
    /**
     * The contact group membership.
     */
    export interface ContactGroupMembership {
      /**
       * The resource name for the contact group, assigned by the server. An ASCII
       * string, in the form of `contactGroups/{contact_group_id}`. Only
       * contact_group_resource_name can be used for modifying memberships. Any contact
       * group membership can be removed, but only user group or "myContacts" or
       * "starred" system groups memberships can be added. A contact must always have at
       * least one contact group membership.
       */
      contactGroupResourceName?: string;
    }
  }

  /**
   * A person's miscellaneous keyword.
   */
  export interface MiscKeyword {
    /**
     * Metadata about the miscellaneous keyword.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The miscellaneous keyword type.
     */
    type?:
      | "TYPE_UNSPECIFIED"
      | "OUTLOOK_BILLING_INFORMATION"
      | "OUTLOOK_DIRECTORY_SERVER"
      | "OUTLOOK_KEYWORD"
      | "OUTLOOK_MILEAGE"
      | "OUTLOOK_PRIORITY"
      | "OUTLOOK_SENSITIVITY"
      | "OUTLOOK_SUBJECT"
      | "OUTLOOK_USER"
      | "HOME"
      | "WORK"
      | "OTHER";

    /**
     * The value of the miscellaneous keyword.
     */
    value?: string;
  }

  /**
   * A person's name. If the name is a mononym, the family name is empty.
   */
  export interface Name {
    /**
     * The family name.
     */
    familyName?: string;

    /**
     * The given name.
     */
    givenName?: string;

    /**
     * The honorific prefixes, such as `Mrs.` or `Dr.`
     */
    honorificPrefix?: string;

    /**
     * The honorific suffixes, such as `Jr.`
     */
    honorificSuffix?: string;

    /**
     * Metadata about the name.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The middle name(s).
     */
    middleName?: string;

    /**
     * The family name spelled as it sounds.
     */
    phoneticFamilyName?: string;

    /**
     * The full name spelled as it sounds.
     */
    phoneticFullName?: string;

    /**
     * The given name spelled as it sounds.
     */
    phoneticGivenName?: string;

    /**
     * The honorific prefixes spelled as they sound.
     */
    phoneticHonorificPrefix?: string;

    /**
     * The honorific suffixes spelled as they sound.
     */
    phoneticHonorificSuffix?: string;

    /**
     * The middle name(s) spelled as they sound.
     */
    phoneticMiddleName?: string;

    /**
     * The free form name value.
     */
    unstructuredName?: string;
  }

  /**
   * A person's nickname.
   */
  export interface Nickname {
    /**
     * Metadata about the nickname.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The type of the nickname.
     */
    type?:
      | "DEFAULT"
      | "MAIDEN_NAME"
      | "INITIALS"
      | "GPLUS"
      | "OTHER_NAME"
      | "ALTERNATE_NAME"
      | "SHORT_NAME";

    /**
     * The nickname.
     */
    value?: string;
  }

  /**
   * A person's occupation.
   */
  export interface Occupation {
    /**
     * Metadata about the occupation.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The occupation; for example, `carpenter`.
     */
    value?: string;
  }

  /**
   * A person's past or current organization. Overlapping date ranges are permitted.
   */
  export interface Organization {
    /**
     * The person's cost center at the organization.
     */
    costCenter?: string;

    /**
     * True if the organization is the person's current organization; false if the
     * organization is a past organization.
     */
    current?: boolean;

    /**
     * The person's department at the organization.
     */
    department?: string;

    /**
     * The domain name associated with the organization; for example, `google.com`.
     */
    domain?: string;

    /**
     * The end date when the person left the organization.
     */
    endDate?: PeopleCreateContactAPI.Date;

    /**
     * The person's full-time equivalent millipercent within the organization (100000 =
     * 100%).
     */
    fullTimeEquivalentMillipercent?: number;

    /**
     * The person's job description at the organization.
     */
    jobDescription?: string;

    /**
     * The location of the organization office the person works at.
     */
    location?: string;

    /**
     * Metadata about the organization.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The name of the organization.
     */
    name?: string;

    /**
     * The phonetic name of the organization.
     */
    phoneticName?: string;

    /**
     * The start date when the person joined the organization.
     */
    startDate?: PeopleCreateContactAPI.Date;

    /**
     * The symbol associated with the organization; for example, a stock ticker symbol,
     * abbreviation, or acronym.
     */
    symbol?: string;

    /**
     * The person's job title at the organization.
     */
    title?: string;

    /**
     * The type of the organization. The type can be custom or one of these predefined
     * values: _ `work` _ `school`
     */
    type?: string;
  }

  /**
   * A person's phone number.
   */
  export interface PhoneNumber {
    /**
     * Metadata about the phone number.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The type of the phone number. The type can be custom or one of these predefined
     * values: _ `home` _ `work` _ `mobile` _ `homeFax` _ `workFax` _ `otherFax` _
     * `pager` _ `workMobile` _ `workPager` _ `main` _ `googleVoice` _ `other`
     */
    type?: string;

    /**
     * The phone number.
     */
    value?: string;
  }

  /**
   * A person's relation to another person.
   */
  export interface Relation {
    /**
     * Metadata about the relation.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The name of the other person this relation refers to.
     */
    person?: string;

    /**
     * The person's relation to the other person. The type can be custom or one of
     * these predefined values: _ `spouse` _ `child` _ `mother` _ `father` _ `parent` _
     * `brother` _ `sister` _ `friend` _ `relative` _ `domesticPartner` _ `manager` _
     * `assistant` _ `referredBy` _ `partner`
     */
    type?: string;
  }

  /**
   * @deprecated **DEPRECATED**: Please use `person.locations` instead. A person's
   * past or current residence.
   */
  export interface Residence {
    /**
     * True if the residence is the person's current residence; false if the residence
     * is a past residence.
     */
    current?: boolean;

    /**
     * Metadata about the residence.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The address of the residence.
     */
    value?: string;
  }

  /**
   * A person's SIP address. Session Initial Protocol addresses are used for VoIP
   * communications to make voice or video calls over the internet.
   */
  export interface SipAddress {
    /**
     * Metadata about the SIP address.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The type of the SIP address. The type can be custom or or one of these
     * predefined values: _ `home` _ `work` _ `mobile` _ `other`
     */
    type?: string;

    /**
     * The SIP address in the
     * [RFC 3261 19.1](https://tools.ietf.org/html/rfc3261#section-19.1) SIP URI
     * format.
     */
    value?: string;
  }

  /**
   * A skill that the person has.
   */
  export interface Skill {
    /**
     * Metadata about the skill.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The skill; for example, `underwater basket weaving`.
     */
    value?: string;
  }

  /**
   * A person's associated URLs.
   */
  export interface URL {
    /**
     * Metadata about the URL.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The type of the URL. The type can be custom or one of these predefined values: _
     * `home` _ `work` _ `blog` _ `profile` _ `homePage` _ `ftp` _ `reservations` _
     * `appInstallPage`: website for a Currents application. \* `other`
     */
    type?: string;

    /**
     * The URL.
     */
    value?: string;
  }

  /**
   * Arbitrary user data that is populated by the end users.
   */
  export interface UserDefined {
    /**
     * The end user specified key of the user defined data.
     */
    key?: string;

    /**
     * Metadata about the user defined data.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The end user specified value of the user defined data.
     */
    value?: string;
  }
}

export declare namespace UpdateContact {
  export { type UpdateContactUpdateParams as UpdateContactUpdateParams };
}
