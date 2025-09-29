// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as PeopleCreateContactAPI from './people-create-contact';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class PeopleCreateContact extends APIResource {
  /**
   * Create a new contact and return the person resource for that contact. The
   * request returns a 400 error if more than one field is specified on a field that
   * is a singleton for contact sources: _ biographies _ birthdays _ genders _ names
   * Mutate requests for the same user should be sent sequentially to avoid increased
   * latency and failures.
   */
  create(
    params: PeopleCreateContactCreateParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<PersonMerged> {
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
      upload_protocol,
      uploadType,
      ...body
    } = params ?? {};
    return this._client.post('/v1/people:createContact', {
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
        upload_protocol,
        uploadType,
      },
      body,
      ...options,
    });
  }
}

/**
 * Represents a whole or partial calendar date, such as a birthday. The time of day
 * and time zone are either specified elsewhere or are insignificant. The date is
 * relative to the Gregorian Calendar. This can represent one of the following: _ A
 * full date, with non-zero year, month, and day values. _ A month and day, with a
 * zero year (for example, an anniversary). _ A year on its own, with a zero month
 * and a zero day. _ A year and month, with a zero day (for example, a credit card
 * expiration date). Related types: _ google.type.TimeOfDay _
 * google.type.DateTime \* google.protobuf.Timestamp
 */
export interface Date {
  /**
   * Day of a month. Must be from 1 to 31 and valid for the year and month, or 0 to
   * specify a year by itself or a year and month where the day isn't significant.
   */
  day?: number;

  /**
   * Month of a year. Must be from 1 to 12, or 0 to specify a year without a month
   * and day.
   */
  month?: number;

  /**
   * Year of the date. Must be from 1 to 9999, or 0 to specify a date without a year.
   */
  year?: number;
}

/**
 * Metadata about a field.
 */
export interface FieldMetadata {
  /**
   * Output only. True if the field is the primary field for all sources in the
   * person. Each person will have at most one field with `primary` set to true.
   */
  primary?: boolean;

  /**
   * The source of the field.
   */
  source?: Source;

  /**
   * True if the field is the primary field for the source. Each source must have at
   * most one field with `source_primary` set to true.
   */
  sourcePrimary?: boolean;

  /**
   * Output only. True if the field is verified; false if the field is unverified. A
   * verified field is typically a name, email address, phone number, or website that
   * has been confirmed to be owned by the person.
   */
  verified?: boolean;
}

/**
 * Information about a person merged from various data sources such as the
 * authenticated user's contacts and profile data. Most fields can have multiple
 * items. The items in a field have no guaranteed order, but each non-empty field
 * is guaranteed to have exactly one field with `metadata.primary` set to true.
 */
export interface PersonMerged {
  /**
   * The person's street addresses.
   */
  addresses?: Array<PersonMerged.Address>;

  /**
   * @deprecated Output only. **DEPRECATED** (Please use `person.ageRanges` instead)
   * The person's age range.
   */
  ageRange?: 'AGE_RANGE_UNSPECIFIED' | 'LESS_THAN_EIGHTEEN' | 'EIGHTEEN_TO_TWENTY' | 'TWENTY_ONE_OR_OLDER';

  /**
   * Output only. The person's age ranges.
   */
  ageRanges?: Array<PersonMerged.AgeRange>;

  /**
   * The person's biographies. This field is a singleton for contact sources.
   */
  biographies?: Array<PersonMerged.Biography>;

  /**
   * The person's birthdays. This field is a singleton for contact sources.
   */
  birthdays?: Array<PersonMerged.Birthday>;

  /**
   * @deprecated **DEPRECATED**: No data will be returned The person's bragging
   * rights.
   */
  braggingRights?: Array<PersonMerged.BraggingRight>;

  /**
   * The person's calendar URLs.
   */
  calendarUrls?: Array<PersonMerged.CalendarURL>;

  /**
   * The person's client data.
   */
  clientData?: Array<PersonMerged.ClientData>;

  /**
   * Output only. The person's cover photos.
   */
  coverPhotos?: Array<PersonMerged.CoverPhoto>;

  /**
   * The person's email addresses. For `people.connections.list` and
   * `otherContacts.list` the number of email addresses is limited to 100. If a
   * Person has more email addresses the entire set can be obtained by calling
   * GetPeople.
   */
  emailAddresses?: Array<PersonMerged.EmailAddress>;

  /**
   * The [HTTP entity tag](https://en.wikipedia.org/wiki/HTTP_ETag) of the resource.
   * Used for web cache validation.
   */
  etag?: string;

  /**
   * The person's events.
   */
  events?: Array<PersonMerged.Event>;

  /**
   * The person's external IDs.
   */
  externalIds?: Array<PersonMerged.ExternalID>;

  /**
   * The person's file-ases.
   */
  fileAses?: Array<PersonMerged.FileAse>;

  /**
   * The person's genders. This field is a singleton for contact sources.
   */
  genders?: Array<PersonMerged.Gender>;

  /**
   * The person's instant messaging clients.
   */
  imClients?: Array<PersonMerged.ImClient>;

  /**
   * The person's interests.
   */
  interests?: Array<PersonMerged.Interest>;

  /**
   * The person's locale preferences.
   */
  locales?: Array<PersonMerged.Locale>;

  /**
   * The person's locations.
   */
  locations?: Array<PersonMerged.Location>;

  /**
   * The person's group memberships.
   */
  memberships?: Array<PersonMerged.Membership>;

  /**
   * Output only. Metadata about the person.
   */
  metadata?: PersonMerged.Metadata;

  /**
   * The person's miscellaneous keywords.
   */
  miscKeywords?: Array<PersonMerged.MiscKeyword>;

  /**
   * The person's names. This field is a singleton for contact sources.
   */
  names?: Array<PersonMerged.Name>;

  /**
   * The person's nicknames.
   */
  nicknames?: Array<PersonMerged.Nickname>;

  /**
   * The person's occupations.
   */
  occupations?: Array<PersonMerged.Occupation>;

  /**
   * The person's past or current organizations.
   */
  organizations?: Array<PersonMerged.Organization>;

  /**
   * The person's phone numbers. For `people.connections.list` and
   * `otherContacts.list` the number of phone numbers is limited to 100. If a Person
   * has more phone numbers the entire set can be obtained by calling GetPeople.
   */
  phoneNumbers?: Array<PersonMerged.PhoneNumber>;

  /**
   * Output only. The person's photos.
   */
  photos?: Array<PersonMerged.Photo>;

  /**
   * The person's relations.
   */
  relations?: Array<PersonMerged.Relation>;

  /**
   * @deprecated Output only. **DEPRECATED**: No data will be returned The person's
   * relationship interests.
   */
  relationshipInterests?: Array<PersonMerged.RelationshipInterest>;

  /**
   * @deprecated Output only. **DEPRECATED**: No data will be returned The person's
   * relationship statuses.
   */
  relationshipStatuses?: Array<PersonMerged.RelationshipStatus>;

  /**
   * @deprecated **DEPRECATED**: (Please use `person.locations` instead) The person's
   * residences.
   */
  residences?: Array<PersonMerged.Residence>;

  /**
   * The resource name for the person, assigned by the server. An ASCII string in the
   * form of `people/{person_id}`.
   */
  resourceName?: string;

  /**
   * The person's SIP addresses.
   */
  sipAddresses?: Array<PersonMerged.SipAddress>;

  /**
   * The person's skills.
   */
  skills?: Array<PersonMerged.Skill>;

  /**
   * @deprecated Output only. **DEPRECATED**: No data will be returned The person's
   * taglines.
   */
  taglines?: Array<PersonMerged.Tagline>;

  /**
   * The person's associated URLs.
   */
  urls?: Array<PersonMerged.URL>;

  /**
   * The person's user defined data.
   */
  userDefined?: Array<PersonMerged.UserDefined>;
}

export namespace PersonMerged {
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
     * Output only. The type of the address translated and formatted in the viewer's
     * account locale or the `Accept-Language` HTTP header locale.
     */
    formattedType?: string;

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
   * A person's age range.
   */
  export interface AgeRange {
    /**
     * The age range.
     */
    ageRange?: 'AGE_RANGE_UNSPECIFIED' | 'LESS_THAN_EIGHTEEN' | 'EIGHTEEN_TO_TWENTY' | 'TWENTY_ONE_OR_OLDER';

    /**
     * Metadata about the age range.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;
  }

  /**
   * A person's short biography.
   */
  export interface Biography {
    /**
     * The content type of the biography.
     */
    contentType?: 'CONTENT_TYPE_UNSPECIFIED' | 'TEXT_PLAIN' | 'TEXT_HTML';

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
     * Output only. The type of the calendar URL translated and formatted in the
     * viewer's account locale or the `Accept-Language` HTTP header locale.
     */
    formattedType?: string;

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
   * A person's cover photo. A large image shown on the person's profile page that
   * represents who they are or what they care about.
   */
  export interface CoverPhoto {
    /**
     * Metadata about the cover photo.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The URL of the cover photo.
     */
    url?: string;
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
     * Output only. The type of the email address translated and formatted in the
     * viewer's account locale or the `Accept-Language` HTTP header locale.
     */
    formattedType?: string;

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
     * Output only. The type of the event translated and formatted in the viewer's
     * account locale or the `Accept-Language` HTTP header locale.
     */
    formattedType?: string;

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
     * Output only. The type of the event translated and formatted in the viewer's
     * account locale or the `Accept-Language` HTTP header locale.
     */
    formattedType?: string;

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
     * Output only. The value of the gender translated and formatted in the viewer's
     * account locale or the `Accept-Language` HTTP header locale. Unspecified or
     * custom value are not localized.
     */
    formattedValue?: string;

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
     * Output only. The protocol of the IM client formatted in the viewer's account
     * locale or the `Accept-Language` HTTP header locale.
     */
    formattedProtocol?: string;

    /**
     * Output only. The type of the IM client translated and formatted in the viewer's
     * account locale or the `Accept-Language` HTTP header locale.
     */
    formattedType?: string;

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
     * Output only. The domain membership.
     */
    domainMembership?: Membership.DomainMembership;

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
       * @deprecated Output only. The contact group ID for the contact group membership.
       */
      contactGroupId?: string;

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

    /**
     * Output only. The domain membership.
     */
    export interface DomainMembership {
      /**
       * True if the person is in the viewer's Google Workspace domain.
       */
      inViewerDomain?: boolean;
    }
  }

  /**
   * Output only. Metadata about the person.
   */
  export interface Metadata {
    /**
     * Output only. True if the person resource has been deleted. Populated only for
     * `people.connections.list` and `otherContacts.list` sync requests.
     */
    deleted?: boolean;

    /**
     * Output only. Resource names of people linked to this resource.
     */
    linkedPeopleResourceNames?: Array<string>;

    /**
     * @deprecated Output only. **DEPRECATED** (Please use
     * `person.metadata.sources.profileMetadata.objectType` instead) The type of the
     * person object.
     */
    objectType?: 'OBJECT_TYPE_UNSPECIFIED' | 'PERSON' | 'PAGE';

    /**
     * Output only. Any former resource names this person has had. Populated only for
     * `people.connections.list` requests that include a sync token. The resource name
     * may change when adding or removing fields that link a contact and profile such
     * as a verified email, verified phone number, or profile URL.
     */
    previousResourceNames?: Array<string>;

    /**
     * The sources of data for the person.
     */
    sources?: Array<PeopleCreateContactAPI.Source>;
  }

  /**
   * A person's miscellaneous keyword.
   */
  export interface MiscKeyword {
    /**
     * Output only. The type of the miscellaneous keyword translated and formatted in
     * the viewer's account locale or the `Accept-Language` HTTP header locale.
     */
    formattedType?: string;

    /**
     * Metadata about the miscellaneous keyword.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The miscellaneous keyword type.
     */
    type?:
      | 'TYPE_UNSPECIFIED'
      | 'OUTLOOK_BILLING_INFORMATION'
      | 'OUTLOOK_DIRECTORY_SERVER'
      | 'OUTLOOK_KEYWORD'
      | 'OUTLOOK_MILEAGE'
      | 'OUTLOOK_PRIORITY'
      | 'OUTLOOK_SENSITIVITY'
      | 'OUTLOOK_SUBJECT'
      | 'OUTLOOK_USER'
      | 'HOME'
      | 'WORK'
      | 'OTHER';

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
     * Output only. The display name formatted according to the locale specified by the
     * viewer's account or the `Accept-Language` HTTP header.
     */
    displayName?: string;

    /**
     * Output only. The display name with the last name first formatted according to
     * the locale specified by the viewer's account or the `Accept-Language` HTTP
     * header.
     */
    displayNameLastFirst?: string;

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
    type?: 'DEFAULT' | 'MAIDEN_NAME' | 'INITIALS' | 'GPLUS' | 'OTHER_NAME' | 'ALTERNATE_NAME' | 'SHORT_NAME';

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
     * Output only. The type of the organization translated and formatted in the
     * viewer's account locale or the `Accept-Language` HTTP header locale.
     */
    formattedType?: string;

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
     * Output only. The canonicalized
     * [ITU-T E.164](https://law.resource.org/pub/us/cfr/ibr/004/itu-t.E.164.1.2008.pdf)
     * form of the phone number.
     */
    canonicalForm?: string;

    /**
     * Output only. The type of the phone number translated and formatted in the
     * viewer's account locale or the `Accept-Language` HTTP header locale.
     */
    formattedType?: string;

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
   * A person's photo. A picture shown next to the person's name to help others
   * recognize the person.
   */
  export interface Photo {
    /**
     * Metadata about the photo.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The URL of the photo. You can change the desired size by appending a query
     * parameter `sz={size}` at the end of the url, where {size} is the size in pixels.
     * Example:
     * https://lh3.googleusercontent.com/-T_wVWLlmg7w/AAAAAAAAAAI/AAAAAAAABa8/00gzXvDBYqw/s100/photo.jpg?sz=50
     */
    url?: string;
  }

  /**
   * A person's relation to another person.
   */
  export interface Relation {
    /**
     * Output only. The type of the relation translated and formatted in the viewer's
     * account locale or the locale specified in the Accept-Language HTTP header.
     */
    formattedType?: string;

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
   * @deprecated **DEPRECATED**: No data will be returned A person's relationship
   * interest .
   */
  export interface RelationshipInterest {
    /**
     * Output only. The value of the relationship interest translated and formatted in
     * the viewer's account locale or the locale specified in the Accept-Language HTTP
     * header.
     */
    formattedValue?: string;

    /**
     * Metadata about the relationship interest.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The kind of relationship the person is looking for. The value can be custom or
     * one of these predefined values: _ `friend` _ `date` _ `relationship` _
     * `networking`
     */
    value?: string;
  }

  /**
   * @deprecated **DEPRECATED**: No data will be returned A person's relationship
   * status.
   */
  export interface RelationshipStatus {
    /**
     * Output only. The value of the relationship status translated and formatted in
     * the viewer's account locale or the `Accept-Language` HTTP header locale.
     */
    formattedValue?: string;

    /**
     * Metadata about the relationship status.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The relationship status. The value can be custom or one of these predefined
     * values: _ `single` _ `inARelationship` _ `engaged` _ `married` _
     * `itsComplicated` _ `openRelationship` _ `widowed` _ `inDomesticPartnership` \*
     * `inCivilUnion`
     */
    value?: string;
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
     * Output only. The type of the SIP address translated and formatted in the
     * viewer's account locale or the `Accept-Language` HTTP header locale.
     */
    formattedType?: string;

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
   * @deprecated **DEPRECATED**: No data will be returned A brief one-line
   * description of the person.
   */
  export interface Tagline {
    /**
     * Metadata about the tagline.
     */
    metadata?: PeopleCreateContactAPI.FieldMetadata;

    /**
     * The tagline.
     */
    value?: string;
  }

  /**
   * A person's associated URLs.
   */
  export interface URL {
    /**
     * Output only. The type of the URL translated and formatted in the viewer's
     * account locale or the `Accept-Language` HTTP header locale.
     */
    formattedType?: string;

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

/**
 * The source of a field.
 */
export interface Source {
  /**
   * The unique identifier within the source type generated by the server.
   */
  id?: string;

  /**
   * **Only populated in `person.metadata.sources`.** The
   * [HTTP entity tag](https://en.wikipedia.org/wiki/HTTP_ETag) of the source. Used
   * for web cache validation.
   */
  etag?: string;

  /**
   * Output only. **Only populated in `person.metadata.sources`.** Metadata about a
   * source of type PROFILE.
   */
  profileMetadata?: Source.ProfileMetadata;

  /**
   * The source type.
   */
  type?:
    | 'SOURCE_TYPE_UNSPECIFIED'
    | 'ACCOUNT'
    | 'PROFILE'
    | 'DOMAIN_PROFILE'
    | 'CONTACT'
    | 'OTHER_CONTACT'
    | 'DOMAIN_CONTACT';

  /**
   * Output only. **Only populated in `person.metadata.sources`.** Last update
   * timestamp of this source.
   */
  updateTime?: string;
}

export namespace Source {
  /**
   * Output only. **Only populated in `person.metadata.sources`.** Metadata about a
   * source of type PROFILE.
   */
  export interface ProfileMetadata {
    /**
     * Output only. The profile object type.
     */
    objectType?: 'OBJECT_TYPE_UNSPECIFIED' | 'PERSON' | 'PAGE';

    /**
     * Output only. The user types.
     */
    userTypes?: Array<'USER_TYPE_UNKNOWN' | 'GOOGLE_USER' | 'GPLUS_USER' | 'GOOGLE_APPS_USER'>;
  }
}

export interface PeopleCreateContactCreateParams {
  /**
   * Query param:
   */
  $?: PeopleCreateContactCreateParams._;

  /**
   * Query param: OAuth access token.
   */
  access_token?: string;

  /**
   * Query param: Data format for response.
   */
  alt?: 'json' | 'media' | 'proto';

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
   * Query param: Required. A field mask to restrict which fields on each person are
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
    | 'READ_SOURCE_TYPE_UNSPECIFIED'
    | 'READ_SOURCE_TYPE_PROFILE'
    | 'READ_SOURCE_TYPE_CONTACT'
    | 'READ_SOURCE_TYPE_DOMAIN_CONTACT'
  >;

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
  addresses?: Array<PeopleCreateContactCreateParams.Address>;

  /**
   * Body param: The person's biographies. This field is a singleton for contact
   * sources.
   */
  biographies?: Array<PeopleCreateContactCreateParams.Biography>;

  /**
   * Body param: The person's birthdays. This field is a singleton for contact
   * sources.
   */
  birthdays?: Array<PeopleCreateContactCreateParams.Birthday>;

  /**
   * @deprecated Body param: **DEPRECATED**: No data will be returned The person's
   * bragging rights.
   */
  braggingRights?: Array<PeopleCreateContactCreateParams.BraggingRight>;

  /**
   * Body param: The person's calendar URLs.
   */
  calendarUrls?: Array<PeopleCreateContactCreateParams.CalendarURL>;

  /**
   * Body param: The person's client data.
   */
  clientData?: Array<PeopleCreateContactCreateParams.ClientData>;

  /**
   * Body param: The person's email addresses. For `people.connections.list` and
   * `otherContacts.list` the number of email addresses is limited to 100. If a
   * Person has more email addresses the entire set can be obtained by calling
   * GetPeople.
   */
  emailAddresses?: Array<PeopleCreateContactCreateParams.EmailAddress>;

  /**
   * Body param: The [HTTP entity tag](https://en.wikipedia.org/wiki/HTTP_ETag) of
   * the resource. Used for web cache validation.
   */
  etag?: string;

  /**
   * Body param: The person's events.
   */
  events?: Array<PeopleCreateContactCreateParams.Event>;

  /**
   * Body param: The person's external IDs.
   */
  externalIds?: Array<PeopleCreateContactCreateParams.ExternalID>;

  /**
   * Body param: The person's file-ases.
   */
  fileAses?: Array<PeopleCreateContactCreateParams.FileAse>;

  /**
   * Body param: The person's genders. This field is a singleton for contact sources.
   */
  genders?: Array<PeopleCreateContactCreateParams.Gender>;

  /**
   * Body param: The person's instant messaging clients.
   */
  imClients?: Array<PeopleCreateContactCreateParams.ImClient>;

  /**
   * Body param: The person's interests.
   */
  interests?: Array<PeopleCreateContactCreateParams.Interest>;

  /**
   * Body param: The person's locale preferences.
   */
  locales?: Array<PeopleCreateContactCreateParams.Locale>;

  /**
   * Body param: The person's locations.
   */
  locations?: Array<PeopleCreateContactCreateParams.Location>;

  /**
   * Body param: The person's group memberships.
   */
  memberships?: Array<PeopleCreateContactCreateParams.Membership>;

  /**
   * Body param: The person's miscellaneous keywords.
   */
  miscKeywords?: Array<PeopleCreateContactCreateParams.MiscKeyword>;

  /**
   * Body param: The person's names. This field is a singleton for contact sources.
   */
  names?: Array<PeopleCreateContactCreateParams.Name>;

  /**
   * Body param: The person's nicknames.
   */
  nicknames?: Array<PeopleCreateContactCreateParams.Nickname>;

  /**
   * Body param: The person's occupations.
   */
  occupations?: Array<PeopleCreateContactCreateParams.Occupation>;

  /**
   * Body param: The person's past or current organizations.
   */
  organizations?: Array<PeopleCreateContactCreateParams.Organization>;

  /**
   * Body param: The person's phone numbers. For `people.connections.list` and
   * `otherContacts.list` the number of phone numbers is limited to 100. If a Person
   * has more phone numbers the entire set can be obtained by calling GetPeople.
   */
  phoneNumbers?: Array<PeopleCreateContactCreateParams.PhoneNumber>;

  /**
   * Body param: The person's relations.
   */
  relations?: Array<PeopleCreateContactCreateParams.Relation>;

  /**
   * @deprecated Body param: **DEPRECATED**: (Please use `person.locations` instead)
   * The person's residences.
   */
  residences?: Array<PeopleCreateContactCreateParams.Residence>;

  /**
   * Body param: The resource name for the person, assigned by the server. An ASCII
   * string in the form of `people/{person_id}`.
   */
  resourceName?: string;

  /**
   * Body param: The person's SIP addresses.
   */
  sipAddresses?: Array<PeopleCreateContactCreateParams.SipAddress>;

  /**
   * Body param: The person's skills.
   */
  skills?: Array<PeopleCreateContactCreateParams.Skill>;

  /**
   * Body param: The person's associated URLs.
   */
  urls?: Array<PeopleCreateContactCreateParams.URL>;

  /**
   * Body param: The person's user defined data.
   */
  userDefined?: Array<PeopleCreateContactCreateParams.UserDefined>;
}

export namespace PeopleCreateContactCreateParams {
  export interface _ {
    /**
     * V1 error format.
     */
    xgafv?: '1' | '2';
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
    contentType?: 'CONTENT_TYPE_UNSPECIFIED' | 'TEXT_PLAIN' | 'TEXT_HTML';

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
      | 'TYPE_UNSPECIFIED'
      | 'OUTLOOK_BILLING_INFORMATION'
      | 'OUTLOOK_DIRECTORY_SERVER'
      | 'OUTLOOK_KEYWORD'
      | 'OUTLOOK_MILEAGE'
      | 'OUTLOOK_PRIORITY'
      | 'OUTLOOK_SENSITIVITY'
      | 'OUTLOOK_SUBJECT'
      | 'OUTLOOK_USER'
      | 'HOME'
      | 'WORK'
      | 'OTHER';

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
    type?: 'DEFAULT' | 'MAIDEN_NAME' | 'INITIALS' | 'GPLUS' | 'OTHER_NAME' | 'ALTERNATE_NAME' | 'SHORT_NAME';

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

export declare namespace PeopleCreateContact {
  export {
    type Date as Date,
    type FieldMetadata as FieldMetadata,
    type PersonMerged as PersonMerged,
    type Source as Source,
    type PeopleCreateContactCreateParams as PeopleCreateContactCreateParams,
  };
}
