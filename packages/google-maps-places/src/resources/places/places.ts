// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIPromise } from "../../core/api-promise";
import { APIResource } from "../../core/resource";
import { RequestOptions } from "../../internal/request-options";
import { path } from "../../internal/utils/path";
import * as PhotosAPI from "./photos";
import {
  PhotoRetrieveMediaParams,
  PhotoRetrieveMediaResponse,
  Photos,
} from "./photos";
import * as PlacesAPI from "./places";

export class Places extends APIResource {
  photos: PhotosAPI.Photos = new PhotosAPI.Photos(this._client);

  /**
   * Get the details of a place based on its resource name, which is a string in the
   * `places/{place_id}` format.
   */
  retrieve(
    place: string,
    query: PlaceRetrieveParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<Place> {
    return this._client.get(path`/v1/places/${place}`, { query, ...options });
  }
}

/**
 * Information about the author of the UGC data. Used in
 * [Photo][google.maps.places.v1.Photo], and
 * [Review][google.maps.places.v1.Review].
 */
export interface AuthorAttribution {
  /**
   * Name of the author of the [Photo][google.maps.places.v1.Photo] or
   * [Review][google.maps.places.v1.Review].
   */
  displayName?: string;

  /**
   * Profile photo URI of the author of the [Photo][google.maps.places.v1.Photo] or
   * [Review][google.maps.places.v1.Review].
   */
  photoUri?: string;

  /**
   * URI of the author of the [Photo][google.maps.places.v1.Photo] or
   * [Review][google.maps.places.v1.Review].
   */
  uri?: string;
}

/**
 * A block of content that can be served individually.
 */
export interface ContentBlock {
  /**
   * Localized variant of a text in a particular language.
   */
  content?: LocalizedText;

  /**
   * Experimental: See
   * https://developers.google.com/maps/documentation/places/web-service/experimental/places-generative
   * for more details.
   *
   * Reference that the generative content is related to.
   */
  references?: ContentBlock.References;

  /**
   * The topic of the content, for example "overview" or "restaurant".
   */
  topic?: string;
}

export namespace ContentBlock {
  /**
   * Experimental: See
   * https://developers.google.com/maps/documentation/places/web-service/experimental/places-generative
   * for more details.
   *
   * Reference that the generative content is related to.
   */
  export interface References {
    /**
     * The list of resource names of the referenced places. This name can be used in
     * other APIs that accept Place resource names.
     */
    places?: Array<string>;

    /**
     * Reviews that serve as references.
     */
    reviews?: Array<PlacesAPI.Review>;
  }
}

/**
 * An object that represents a latitude/longitude pair. This is expressed as a pair
 * of doubles to represent degrees latitude and degrees longitude. Unless specified
 * otherwise, this must conform to the
 * <a href="http://www.unoosa.org/pdf/icg/2012/template/WGS_84.pdf">WGS84
 * standard</a>. Values must be within normalized ranges.
 */
export interface LatLng {
  /**
   * The latitude in degrees. It must be in the range [-90.0, +90.0].
   */
  latitude?: number;

  /**
   * The longitude in degrees. It must be in the range [-180.0, +180.0].
   */
  longitude?: number;
}

/**
 * Localized variant of a text in a particular language.
 */
export interface LocalizedText {
  /**
   * The text's BCP-47 language code, such as "en-US" or "sr-Latn".
   *
   * For more information, see
   * http://www.unicode.org/reports/tr35/#Unicode_locale_identifier.
   */
  languageCode?: string;

  /**
   * Localized string in the language corresponding to `language_code' below.
   */
  text?: string;
}

/**
 * Represents an amount of money with its currency type.
 */
export interface Money {
  /**
   * The three-letter currency code defined in ISO 4217.
   */
  currencyCode?: string;

  /**
   * Number of nano (10^-9) units of the amount. The value must be between
   * -999,999,999 and +999,999,999 inclusive. If `units` is positive, `nanos` must be
   * positive or zero. If `units` is zero, `nanos` can be positive, zero, or
   * negative. If `units` is negative, `nanos` must be negative or zero. For example
   * $-1.75 is represented as `units`=-1 and `nanos`=-750,000,000.
   */
  nanos?: number;

  /**
   * The whole units of the amount. For example if `currencyCode` is `"USD"`, then 1
   * unit is one US dollar.
   */
  units?: string;
}

/**
 * Status changing points.
 */
export interface PeriodPoint {
  /**
   * Date in the local timezone for the place.
   */
  date?: string;

  /**
   * A day of the week, as an integer in the range 0-6. 0 is Sunday, 1 is Monday,
   * etc.
   */
  day?: number;

  /**
   * The hour in 24 hour format. Ranges from 0 to 23.
   */
  hour?: number;

  /**
   * The minute. Ranges from 0 to 59.
   */
  minute?: number;

  /**
   * Whether or not this endpoint was truncated. Truncation occurs when the real
   * hours are outside the times we are willing to return hours between, so we
   * truncate the hours back to these boundaries. This ensures that at most 24 \* 7
   * hours from midnight of the day of the request are returned.
   */
  truncated?: boolean;
}

/**
 * Information about a photo of a place.
 */
export interface Photo {
  /**
   * This photo's authors.
   */
  authorAttributions?: Array<AuthorAttribution>;

  /**
   * A link where users can flag a problem with the photo.
   */
  flagContentUri?: string;

  /**
   * A link to show the photo on Google Maps.
   */
  googleMapsUri?: string;

  /**
   * The maximum available height, in pixels.
   */
  heightPx?: number;

  /**
   * Identifier. A reference representing this place photo which may be used to look
   * up this place photo again (also called the API "resource" name:
   * `places/{place_id}/photos/{photo}`).
   */
  name?: string;

  /**
   * The maximum available width, in pixels.
   */
  widthPx?: number;
}

/**
 * All the information representing a Place.
 */
export interface Place {
  /**
   * The unique identifier of a place.
   */
  id?: string;

  /**
   * Information about the accessibility options a place offers.
   */
  accessibilityOptions?: Place.AccessibilityOptions;

  /**
   * Repeated components for each locality level. Note the following facts about the
   * address_components[] array:
   *
   * - The array of address components may contain more components than the
   *   formatted_address.
   * - The array does not necessarily include all the political entities that contain
   *   an address, apart from those included in the formatted_address. To retrieve
   *   all the political entities that contain a specific address, you should use
   *   reverse geocoding, passing the latitude/longitude of the address as a
   *   parameter to the request.
   * - The format of the response is not guaranteed to remain the same between
   *   requests. In particular, the number of address_components varies based on the
   *   address requested and can change over time for the same address. A component
   *   can change position in the array. The type of the component can change. A
   *   particular component may be missing in a later response.
   */
  addressComponents?: Array<Place.AddressComponent>;

  /**
   * A relational description of a location. Includes a ranked set of nearby
   * landmarks and precise containing areas and their relationship to the target
   * location.
   */
  addressDescriptor?: Place.AddressDescriptor;

  /**
   * The place's address in adr microformat: http://microformats.org/wiki/adr.
   */
  adrFormatAddress?: string;

  /**
   * Place allows dogs.
   */
  allowsDogs?: boolean;

  /**
   * A set of data provider that must be shown with this result.
   */
  attributions?: Array<Place.Attribution>;

  /**
   * The business status for the place.
   */
  businessStatus?:
    | "BUSINESS_STATUS_UNSPECIFIED"
    | "OPERATIONAL"
    | "CLOSED_TEMPORARILY"
    | "CLOSED_PERMANENTLY";

  /**
   * List of places in which the current place is located.
   */
  containingPlaces?: Array<Place.ContainingPlace>;

  /**
   * Specifies if the business supports curbside pickup.
   */
  curbsidePickup?: boolean;

  /**
   * Information about business hour of the place.
   */
  currentOpeningHours?: PlaceOpeningHours;

  /**
   * Contains an array of entries for the next seven days including information about
   * secondary hours of a business. Secondary hours are different from a business's
   * main hours. For example, a restaurant can specify drive through hours or
   * delivery hours as its secondary hours. This field populates the type subfield,
   * which draws from a predefined list of opening hours types (such as
   * DRIVE_THROUGH, PICKUP, or TAKEOUT) based on the types of the place. This field
   * includes the special_days subfield of all hours, set for dates that have
   * exceptional hours.
   */
  currentSecondaryOpeningHours?: Array<PlaceOpeningHours>;

  /**
   * Specifies if the business supports delivery.
   */
  delivery?: boolean;

  /**
   * Specifies if the business supports indoor or outdoor seating options.
   */
  dineIn?: boolean;

  /**
   * Localized variant of a text in a particular language.
   */
  displayName?: LocalizedText;

  /**
   * Localized variant of a text in a particular language.
   */
  editorialSummary?: LocalizedText;

  /**
   * The summary of amenities near the EV charging station. This only applies to
   * places with type `electric_vehicle_charging_station`. The `overview` field is
   * guaranteed to be provided while the other fields are optional.
   */
  evChargeAmenitySummary?: Place.EvChargeAmenitySummary;

  /**
   * Information about the EV Charge Station hosted in Place. Terminology follows
   * https://afdc.energy.gov/fuels/electricity_infrastructure.html One port could
   * charge one car at a time. One port has one or more connectors. One station has
   * one or more ports.
   */
  evChargeOptions?: Place.EvChargeOptions;

  /**
   * A full, human-readable address for this place.
   */
  formattedAddress?: string;

  /**
   * The most recent information about fuel options in a gas station. This
   * information is updated regularly.
   */
  fuelOptions?: Place.FuelOptions;

  /**
   * AI-generated summary of the place.
   */
  generativeSummary?: Place.GenerativeSummary;

  /**
   * Place is good for children.
   */
  goodForChildren?: boolean;

  /**
   * Place accommodates groups.
   */
  goodForGroups?: boolean;

  /**
   * Place is suitable for watching sports.
   */
  goodForWatchingSports?: boolean;

  /**
   * A URL providing more information about this place.
   */
  googleMapsUri?: string;

  /**
   * Background color for icon_mask in hex format, e.g. #909CE1.
   */
  iconBackgroundColor?: string;

  /**
   * A truncated URL to an icon mask. User can access different icon type by
   * appending type suffix to the end (eg, ".svg" or ".png").
   */
  iconMaskBaseUri?: string;

  /**
   * A human-readable phone number for the place, in international format.
   */
  internationalPhoneNumber?: string;

  /**
   * Place provides live music.
   */
  liveMusic?: boolean;

  /**
   * An object that represents a latitude/longitude pair. This is expressed as a pair
   * of doubles to represent degrees latitude and degrees longitude. Unless specified
   * otherwise, this must conform to the
   * <a href="http://www.unoosa.org/pdf/icg/2012/template/WGS_84.pdf">WGS84
   * standard</a>. Values must be within normalized ranges.
   */
  location?: LatLng;

  /**
   * Place has a children's menu.
   */
  menuForChildren?: boolean;

  /**
   * This Place's resource name, in `places/{place_id}` format. Can be used to look
   * up the Place.
   */
  name?: string;

  /**
   * A human-readable phone number for the place, in national format.
   */
  nationalPhoneNumber?: string;

  /**
   * A summary of points of interest near the place.
   */
  neighborhoodSummary?: Place.NeighborhoodSummary;

  /**
   * Place provides outdoor seating.
   */
  outdoorSeating?: boolean;

  /**
   * Information about parking options for the place. A parking lot could support
   * more than one option at the same time.
   */
  parkingOptions?: Place.ParkingOptions;

  /**
   * Payment options the place accepts.
   */
  paymentOptions?: Place.PaymentOptions;

  /**
   * Information (including references) about photos of this place. A maximum of 10
   * photos can be returned.
   */
  photos?: Array<Photo>;

  /**
   * Plus code (http://plus.codes) is a location reference with two formats: global
   * code defining a 14mx14m (1/8000th of a degree) or smaller rectangle, and
   * compound code, replacing the prefix with a reference location.
   */
  plusCode?: Place.PlusCode;

  /**
   * Represents a postal address, e.g. for postal delivery or payments addresses.
   * Given a postal address, a postal service can deliver items to a premise, P.O.
   * Box or similar. It is not intended to model geographical locations (roads,
   * towns, mountains).
   *
   * In typical usage an address would be created via user input or from importing
   * existing data, depending on the type of process.
   *
   * Advice on address input / editing:
   *
   * - Use an i18n-ready address widget such as
   *   https://github.com/google/libaddressinput)
   * - Users should not be presented with UI elements for input or editing of fields
   *   outside countries where that field is used.
   *
   * For more guidance on how to use this schema, please see:
   * https://support.google.com/business/answer/6397478
   */
  postalAddress?: Place.PostalAddress;

  /**
   * Price level of the place.
   */
  priceLevel?:
    | "PRICE_LEVEL_UNSPECIFIED"
    | "PRICE_LEVEL_FREE"
    | "PRICE_LEVEL_INEXPENSIVE"
    | "PRICE_LEVEL_MODERATE"
    | "PRICE_LEVEL_EXPENSIVE"
    | "PRICE_LEVEL_VERY_EXPENSIVE";

  /**
   * The price range associated with a Place. `end_price` could be unset, which
   * indicates a range without upper bound (e.g. "More than $100").
   */
  priceRange?: Place.PriceRange;

  /**
   * The primary type of the given result. This type must be one of the Places API
   * supported types. For example, "restaurant", "cafe", "airport", etc. A place can
   * only have a single primary type. For the complete list of possible values, see
   * Table A and Table B at
   * https://developers.google.com/maps/documentation/places/web-service/place-types.
   * The primary type may be missing if the place's primary type is not a supported
   * type. When a primary type is present, it is always one of the types in the
   * `types` field.
   */
  primaryType?: string;

  /**
   * Localized variant of a text in a particular language.
   */
  primaryTypeDisplayName?: LocalizedText;

  /**
   * Indicates whether the place is a pure service area business. Pure service area
   * business is a business that visits or delivers to customers directly but does
   * not serve customers at their business address. For example, businesses like
   * cleaning services or plumbers. Those businesses may not have a physical address
   * or location on Google Maps.
   */
  pureServiceAreaBusiness?: boolean;

  /**
   * A rating between 1.0 and 5.0, based on user reviews of this place.
   */
  rating?: number;

  /**
   * Information about business hour of the place.
   */
  regularOpeningHours?: PlaceOpeningHours;

  /**
   * Contains an array of entries for information about regular secondary hours of a
   * business. Secondary hours are different from a business's main hours. For
   * example, a restaurant can specify drive through hours or delivery hours as its
   * secondary hours. This field populates the type subfield, which draws from a
   * predefined list of opening hours types (such as DRIVE_THROUGH, PICKUP, or
   * TAKEOUT) based on the types of the place.
   */
  regularSecondaryOpeningHours?: Array<PlaceOpeningHours>;

  /**
   * Specifies if the place supports reservations.
   */
  reservable?: boolean;

  /**
   * Place has restroom.
   */
  restroom?: boolean;

  /**
   * List of reviews about this place, sorted by relevance. A maximum of 5 reviews
   * can be returned.
   */
  reviews?: Array<Review>;

  /**
   * AI-generated summary of the place using user reviews.
   */
  reviewSummary?: Place.ReviewSummary;

  /**
   * Specifies if the place serves beer.
   */
  servesBeer?: boolean;

  /**
   * Specifies if the place serves breakfast.
   */
  servesBreakfast?: boolean;

  /**
   * Specifies if the place serves brunch.
   */
  servesBrunch?: boolean;

  /**
   * Place serves cocktails.
   */
  servesCocktails?: boolean;

  /**
   * Place serves coffee.
   */
  servesCoffee?: boolean;

  /**
   * Place serves dessert.
   */
  servesDessert?: boolean;

  /**
   * Specifies if the place serves dinner.
   */
  servesDinner?: boolean;

  /**
   * Specifies if the place serves lunch.
   */
  servesLunch?: boolean;

  /**
   * Specifies if the place serves vegetarian food.
   */
  servesVegetarianFood?: boolean;

  /**
   * Specifies if the place serves wine.
   */
  servesWine?: boolean;

  /**
   * A short, human-readable address for this place.
   */
  shortFormattedAddress?: string;

  /**
   * A list of sub-destinations related to the place.
   */
  subDestinations?: Array<Place.SubDestination>;

  /**
   * Specifies if the business supports takeout.
   */
  takeout?: boolean;

  /**
   * Represents a time zone from the
   * [IANA Time Zone Database](https://www.iana.org/time-zones).
   */
  timeZone?: Place.TimeZone;

  /**
   * A set of type tags for this result. For example, "political" and "locality". For
   * the complete list of possible values, see Table A and Table B at
   * https://developers.google.com/maps/documentation/places/web-service/place-types
   */
  types?: Array<string>;

  /**
   * The total number of reviews (with or without text) for this place.
   */
  userRatingCount?: number;

  /**
   * Number of minutes this place's timezone is currently offset from UTC. This is
   * expressed in minutes to support timezones that are offset by fractions of an
   * hour, e.g. X hours and 15 minutes.
   */
  utcOffsetMinutes?: number;

  /**
   * A latitude-longitude viewport, represented as two diagonally opposite `low` and
   * `high` points. A viewport is considered a closed region, i.e. it includes its
   * boundary. The latitude bounds must range between -90 to 90 degrees inclusive,
   * and the longitude bounds must range between -180 to 180 degrees inclusive.
   * Various cases include:
   *
   * - If `low` = `high`, the viewport consists of that single point.
   *
   * - If `low.longitude` > `high.longitude`, the longitude range is inverted (the
   *   viewport crosses the 180 degree longitude line).
   *
   * - If `low.longitude` = -180 degrees and `high.longitude` = 180 degrees, the
   *   viewport includes all longitudes.
   *
   * - If `low.longitude` = 180 degrees and `high.longitude` = -180 degrees, the
   *   longitude range is empty.
   *
   * - If `low.latitude` > `high.latitude`, the latitude range is empty.
   *
   * Both `low` and `high` must be populated, and the represented box cannot be empty
   * (as specified by the definitions above). An empty viewport will result in an
   * error.
   *
   * For example, this viewport fully encloses New York City:
   *
   * { "low": { "latitude": 40.477398, "longitude": -74.259087 }, "high": {
   * "latitude": 40.91618, "longitude": -73.70018 } }
   */
  viewport?: Viewport;

  /**
   * The authoritative website for this place, e.g. a business' homepage. Note that
   * for places that are part of a chain (e.g. an IKEA store), this will usually be
   * the website for the individual store, not the overall chain.
   */
  websiteUri?: string;
}

export namespace Place {
  /**
   * Information about the accessibility options a place offers.
   */
  export interface AccessibilityOptions {
    /**
     * Places has wheelchair accessible entrance.
     */
    wheelchairAccessibleEntrance?: boolean;

    /**
     * Place offers wheelchair accessible parking.
     */
    wheelchairAccessibleParking?: boolean;

    /**
     * Place has wheelchair accessible restroom.
     */
    wheelchairAccessibleRestroom?: boolean;

    /**
     * Place has wheelchair accessible seating.
     */
    wheelchairAccessibleSeating?: boolean;
  }

  /**
   * The structured components that form the formatted address, if this information
   * is available.
   */
  export interface AddressComponent {
    /**
     * The language used to format this components, in CLDR notation.
     */
    languageCode?: string;

    /**
     * The full text description or name of the address component. For example, an
     * address component for the country Australia may have a long_name of "Australia".
     */
    longText?: string;

    /**
     * An abbreviated textual name for the address component, if available. For
     * example, an address component for the country of Australia may have a short_name
     * of "AU".
     */
    shortText?: string;

    /**
     * An array indicating the type(s) of the address component.
     */
    types?: Array<string>;
  }

  /**
   * A relational description of a location. Includes a ranked set of nearby
   * landmarks and precise containing areas and their relationship to the target
   * location.
   */
  export interface AddressDescriptor {
    /**
     * A ranked list of containing or adjacent areas. The most recognizable and precise
     * areas are ranked first.
     */
    areas?: Array<AddressDescriptor.Area>;

    /**
     * A ranked list of nearby landmarks. The most recognizable and nearby landmarks
     * are ranked first.
     */
    landmarks?: Array<AddressDescriptor.Landmark>;
  }

  export namespace AddressDescriptor {
    /**
     * Area information and the area's relationship with the target location.
     *
     * Areas includes precise sublocality, neighborhoods, and large compounds that are
     * useful for describing a location.
     */
    export interface Area {
      /**
       * Defines the spatial relationship between the target location and the area.
       */
      containment?: "CONTAINMENT_UNSPECIFIED" | "WITHIN" | "OUTSKIRTS" | "NEAR";

      /**
       * Localized variant of a text in a particular language.
       */
      displayName?: PlacesAPI.LocalizedText;

      /**
       * The area's resource name.
       */
      name?: string;

      /**
       * The area's place id.
       */
      placeId?: string;
    }

    /**
     * Basic landmark information and the landmark's relationship with the target
     * location.
     *
     * Landmarks are prominent places that can be used to describe a location.
     */
    export interface Landmark {
      /**
       * Localized variant of a text in a particular language.
       */
      displayName?: PlacesAPI.LocalizedText;

      /**
       * The landmark's resource name.
       */
      name?: string;

      /**
       * The landmark's place id.
       */
      placeId?: string;

      /**
       * Defines the spatial relationship between the target location and the landmark.
       */
      spatialRelationship?:
        | "NEAR"
        | "WITHIN"
        | "BESIDE"
        | "ACROSS_THE_ROAD"
        | "DOWN_THE_ROAD"
        | "AROUND_THE_CORNER"
        | "BEHIND";

      /**
       * The straight line distance, in meters, between the center point of the target
       * and the center point of the landmark. In some situations, this value can be
       * longer than `travel_distance_meters`.
       */
      straightLineDistanceMeters?: number;

      /**
       * The travel distance, in meters, along the road network from the target to the
       * landmark, if known. This value does not take into account the mode of
       * transportation, such as walking, driving, or biking.
       */
      travelDistanceMeters?: number;

      /**
       * A set of type tags for this landmark. For a complete list of possible values,
       * see
       * https://developers.google.com/maps/documentation/places/web-service/place-types.
       */
      types?: Array<string>;
    }
  }

  /**
   * Information about data providers of this place.
   */
  export interface Attribution {
    /**
     * Name of the Place's data provider.
     */
    provider?: string;

    /**
     * URI to the Place's data provider.
     */
    providerUri?: string;
  }

  /**
   * Info about the place in which this place is located.
   */
  export interface ContainingPlace {
    /**
     * The place id of the place in which this place is located.
     */
    id?: string;

    /**
     * The resource name of the place in which this place is located.
     */
    name?: string;
  }

  /**
   * The summary of amenities near the EV charging station. This only applies to
   * places with type `electric_vehicle_charging_station`. The `overview` field is
   * guaranteed to be provided while the other fields are optional.
   */
  export interface EvChargeAmenitySummary {
    /**
     * A block of content that can be served individually.
     */
    coffee?: PlacesAPI.ContentBlock;

    /**
     * Localized variant of a text in a particular language.
     */
    disclosureText?: PlacesAPI.LocalizedText;

    /**
     * A link where users can flag a problem with the summary.
     */
    flagContentUri?: string;

    /**
     * A block of content that can be served individually.
     */
    overview?: PlacesAPI.ContentBlock;

    /**
     * A block of content that can be served individually.
     */
    restaurant?: PlacesAPI.ContentBlock;

    /**
     * A block of content that can be served individually.
     */
    store?: PlacesAPI.ContentBlock;
  }

  /**
   * Information about the EV Charge Station hosted in Place. Terminology follows
   * https://afdc.energy.gov/fuels/electricity_infrastructure.html One port could
   * charge one car at a time. One port has one or more connectors. One station has
   * one or more ports.
   */
  export interface EvChargeOptions {
    /**
     * A list of EV charging connector aggregations that contain connectors of the same
     * type and same charge rate.
     */
    connectorAggregation?: Array<EvChargeOptions.ConnectorAggregation>;

    /**
     * Number of connectors at this station. However, because some ports can have
     * multiple connectors but only be able to charge one car at a time (e.g.) the
     * number of connectors may be greater than the total number of cars which can
     * charge simultaneously.
     */
    connectorCount?: number;
  }

  export namespace EvChargeOptions {
    /**
     * EV charging information grouped by [type, max_charge_rate_kw]. Shows EV charge
     * aggregation of connectors that have the same type and max charge rate in kw.
     */
    export interface ConnectorAggregation {
      /**
       * The timestamp when the connector availability information in this aggregation
       * was last updated.
       */
      availabilityLastUpdateTime?: string;

      /**
       * Number of connectors in this aggregation that are currently available.
       */
      availableCount?: number;

      /**
       * Number of connectors in this aggregation.
       */
      count?: number;

      /**
       * The static max charging rate in kw of each connector in the aggregation.
       */
      maxChargeRateKw?: number;

      /**
       * Number of connectors in this aggregation that are currently out of service.
       */
      outOfServiceCount?: number;

      /**
       * The connector type of this aggregation.
       */
      type?:
        | "EV_CONNECTOR_TYPE_UNSPECIFIED"
        | "EV_CONNECTOR_TYPE_OTHER"
        | "EV_CONNECTOR_TYPE_J1772"
        | "EV_CONNECTOR_TYPE_TYPE_2"
        | "EV_CONNECTOR_TYPE_CHADEMO"
        | "EV_CONNECTOR_TYPE_CCS_COMBO_1"
        | "EV_CONNECTOR_TYPE_CCS_COMBO_2"
        | "EV_CONNECTOR_TYPE_TESLA"
        | "EV_CONNECTOR_TYPE_UNSPECIFIED_GB_T"
        | "EV_CONNECTOR_TYPE_UNSPECIFIED_WALL_OUTLET"
        | "EV_CONNECTOR_TYPE_NACS";
    }
  }

  /**
   * The most recent information about fuel options in a gas station. This
   * information is updated regularly.
   */
  export interface FuelOptions {
    /**
     * The last known fuel price for each type of fuel this station has. There is one
     * entry per fuel type this station has. Order is not important.
     */
    fuelPrices?: Array<FuelOptions.FuelPrice>;
  }

  export namespace FuelOptions {
    /**
     * Fuel price information for a given type.
     */
    export interface FuelPrice {
      /**
       * Represents an amount of money with its currency type.
       */
      price?: PlacesAPI.Money;

      /**
       * The type of fuel.
       */
      type?:
        | "FUEL_TYPE_UNSPECIFIED"
        | "DIESEL"
        | "DIESEL_PLUS"
        | "REGULAR_UNLEADED"
        | "MIDGRADE"
        | "PREMIUM"
        | "SP91"
        | "SP91_E10"
        | "SP92"
        | "SP95"
        | "SP95_E10"
        | "SP98"
        | "SP99"
        | "SP100"
        | "LPG"
        | "E80"
        | "E85"
        | "E100"
        | "METHANE"
        | "BIO_DIESEL"
        | "TRUCK_DIESEL";

      /**
       * The time the fuel price was last updated.
       */
      updateTime?: string;
    }
  }

  /**
   * AI-generated summary of the place.
   */
  export interface GenerativeSummary {
    /**
     * Localized variant of a text in a particular language.
     */
    disclosureText?: PlacesAPI.LocalizedText;

    /**
     * Localized variant of a text in a particular language.
     */
    overview?: PlacesAPI.LocalizedText;

    /**
     * A link where users can flag a problem with the overview summary.
     */
    overviewFlagContentUri?: string;
  }

  /**
   * A summary of points of interest near the place.
   */
  export interface NeighborhoodSummary {
    /**
     * A block of content that can be served individually.
     */
    description?: PlacesAPI.ContentBlock;

    /**
     * Localized variant of a text in a particular language.
     */
    disclosureText?: PlacesAPI.LocalizedText;

    /**
     * A link where users can flag a problem with the summary.
     */
    flagContentUri?: string;

    /**
     * A block of content that can be served individually.
     */
    overview?: PlacesAPI.ContentBlock;
  }

  /**
   * Information about parking options for the place. A parking lot could support
   * more than one option at the same time.
   */
  export interface ParkingOptions {
    /**
     * Place offers free garage parking.
     */
    freeGarageParking?: boolean;

    /**
     * Place offers free parking lots.
     */
    freeParkingLot?: boolean;

    /**
     * Place offers free street parking.
     */
    freeStreetParking?: boolean;

    /**
     * Place offers paid garage parking.
     */
    paidGarageParking?: boolean;

    /**
     * Place offers paid parking lots.
     */
    paidParkingLot?: boolean;

    /**
     * Place offers paid street parking.
     */
    paidStreetParking?: boolean;

    /**
     * Place offers valet parking.
     */
    valetParking?: boolean;
  }

  /**
   * Payment options the place accepts.
   */
  export interface PaymentOptions {
    /**
     * Place accepts cash only as payment. Places with this attribute may still accept
     * other payment methods.
     */
    acceptsCashOnly?: boolean;

    /**
     * Place accepts credit cards as payment.
     */
    acceptsCreditCards?: boolean;

    /**
     * Place accepts debit cards as payment.
     */
    acceptsDebitCards?: boolean;

    /**
     * Place accepts NFC payments.
     */
    acceptsNfc?: boolean;
  }

  /**
   * Plus code (http://plus.codes) is a location reference with two formats: global
   * code defining a 14mx14m (1/8000th of a degree) or smaller rectangle, and
   * compound code, replacing the prefix with a reference location.
   */
  export interface PlusCode {
    /**
     * Place's compound code, such as "33GV+HQ, Ramberg, Norway", containing the suffix
     * of the global code and replacing the prefix with a formatted name of a reference
     * entity.
     */
    compoundCode?: string;

    /**
     * Place's global (full) code, such as "9FWM33GV+HQ", representing an 1/8000 by
     * 1/8000 degree area (~14 by 14 meters).
     */
    globalCode?: string;
  }

  /**
   * Represents a postal address, e.g. for postal delivery or payments addresses.
   * Given a postal address, a postal service can deliver items to a premise, P.O.
   * Box or similar. It is not intended to model geographical locations (roads,
   * towns, mountains).
   *
   * In typical usage an address would be created via user input or from importing
   * existing data, depending on the type of process.
   *
   * Advice on address input / editing:
   *
   * - Use an i18n-ready address widget such as
   *   https://github.com/google/libaddressinput)
   * - Users should not be presented with UI elements for input or editing of fields
   *   outside countries where that field is used.
   *
   * For more guidance on how to use this schema, please see:
   * https://support.google.com/business/answer/6397478
   */
  export interface PostalAddress {
    /**
     * Unstructured address lines describing the lower levels of an address.
     *
     * Because values in address_lines do not have type information and may sometimes
     * contain multiple values in a single field (e.g. "Austin, TX"), it is important
     * that the line order is clear. The order of address lines should be "envelope
     * order" for the country/region of the address. In places where this can vary
     * (e.g. Japan), address_language is used to make it explicit (e.g. "ja" for
     * large-to-small ordering and "ja-Latn" or "en" for small-to-large). This way, the
     * most specific line of an address can be selected based on the language.
     *
     * The minimum permitted structural representation of an address consists of a
     * region_code with all remaining information placed in the address_lines. It would
     * be possible to format such an address very approximately without geocoding, but
     * no semantic reasoning could be made about any of the address components until it
     * was at least partially resolved.
     *
     * Creating an address only containing a region_code and address_lines, and then
     * geocoding is the recommended way to handle completely unstructured addresses (as
     * opposed to guessing which parts of the address should be localities or
     * administrative areas).
     */
    addressLines?: Array<string>;

    /**
     * Optional. Highest administrative subdivision which is used for postal addresses
     * of a country or region. For example, this can be a state, a province, an oblast,
     * or a prefecture. Specifically, for Spain this is the province and not the
     * autonomous community (e.g. "Barcelona" and not "Catalonia"). Many countries
     * don't use an administrative area in postal addresses. E.g. in Switzerland this
     * should be left unpopulated.
     */
    administrativeArea?: string;

    /**
     * Optional. BCP-47 language code of the contents of this address (if known). This
     * is often the UI language of the input form or is expected to match one of the
     * languages used in the address' country/region, or their transliterated
     * equivalents. This can affect formatting in certain countries, but is not
     * critical to the correctness of the data and will never affect any validation or
     * other non-formatting related operations.
     *
     * If this value is not known, it should be omitted (rather than specifying a
     * possibly incorrect default).
     *
     * Examples: "zh-Hant", "ja", "ja-Latn", "en".
     */
    languageCode?: string;

    /**
     * Optional. Generally refers to the city/town portion of the address. Examples: US
     * city, IT comune, UK post town. In regions of the world where localities are not
     * well defined or do not fit into this structure well, leave locality empty and
     * use address_lines.
     */
    locality?: string;

    /**
     * Optional. The name of the organization at the address.
     */
    organization?: string;

    /**
     * Optional. Postal code of the address. Not all countries use or require postal
     * codes to be present, but where they are used, they may trigger additional
     * validation with other parts of the address (e.g. state/zip validation in the
     * U.S.A.).
     */
    postalCode?: string;

    /**
     * Optional. The recipient at the address. This field may, under certain
     * circumstances, contain multiline information. For example, it might contain
     * "care of" information.
     */
    recipients?: Array<string>;

    /**
     * Required. CLDR region code of the country/region of the address. This is never
     * inferred and it is up to the user to ensure the value is correct. See
     * http://cldr.unicode.org/ and
     * http://www.unicode.org/cldr/charts/30/supplemental/territory_information.html
     * for details. Example: "CH" for Switzerland.
     */
    regionCode?: string;

    /**
     * The schema revision of the `PostalAddress`. This must be set to 0, which is the
     * latest revision.
     *
     * All new revisions **must** be backward compatible with old revisions.
     */
    revision?: number;

    /**
     * Optional. Additional, country-specific, sorting code. This is not used in most
     * regions. Where it is used, the value is either a string like "CEDEX", optionally
     * followed by a number (e.g. "CEDEX 7"), or just a number alone, representing the
     * "sector code" (Jamaica), "delivery area indicator" (Malawi) or "post office
     * indicator" (e.g. Côte d'Ivoire).
     */
    sortingCode?: string;

    /**
     * Optional. Sublocality of the address. For example, this can be neighborhoods,
     * boroughs, districts.
     */
    sublocality?: string;
  }

  /**
   * The price range associated with a Place. `end_price` could be unset, which
   * indicates a range without upper bound (e.g. "More than $100").
   */
  export interface PriceRange {
    /**
     * Represents an amount of money with its currency type.
     */
    endPrice?: PlacesAPI.Money;

    /**
     * Represents an amount of money with its currency type.
     */
    startPrice?: PlacesAPI.Money;
  }

  /**
   * AI-generated summary of the place using user reviews.
   */
  export interface ReviewSummary {
    /**
     * Localized variant of a text in a particular language.
     */
    disclosureText?: PlacesAPI.LocalizedText;

    /**
     * A link where users can flag a problem with the summary.
     */
    flagContentUri?: string;

    /**
     * Localized variant of a text in a particular language.
     */
    text?: PlacesAPI.LocalizedText;
  }

  /**
   * Sub-destinations are specific places associated with a main place. These provide
   * more specific destinations for users who are searching within a large or complex
   * place, like an airport, national park, university, or stadium. For example,
   * sub-destinations at an airport might include associated terminals and parking
   * lots. Sub-destinations return the place ID and place resource name, which can be
   * used in subsequent Place Details (New) requests to fetch richer details,
   * including the sub-destination's display name and location.
   */
  export interface SubDestination {
    /**
     * The place id of the sub-destination.
     */
    id?: string;

    /**
     * The resource name of the sub-destination.
     */
    name?: string;
  }

  /**
   * Represents a time zone from the
   * [IANA Time Zone Database](https://www.iana.org/time-zones).
   */
  export interface TimeZone {
    /**
     * IANA Time Zone Database time zone, e.g. "America/New_York".
     */
    id?: string;

    /**
     * Optional. IANA Time Zone Database version number, e.g. "2019a".
     */
    version?: string;
  }
}

/**
 * Information about business hour of the place.
 */
export interface PlaceOpeningHours {
  /**
   * The next time the current opening hours period ends up to 7 days in the future.
   * This field is only populated if the opening hours period is active at the time
   * of serving the request.
   */
  nextCloseTime?: string;

  /**
   * The next time the current opening hours period starts up to 7 days in the
   * future. This field is only populated if the opening hours period is not active
   * at the time of serving the request.
   */
  nextOpenTime?: string;

  /**
   * Whether the opening hours period is currently active. For regular opening hours
   * and current opening hours, this field means whether the place is open. For
   * secondary opening hours and current secondary opening hours, this field means
   * whether the secondary hours of this place is active.
   */
  openNow?: boolean;

  /**
   * The periods that this place is open during the week. The periods are in
   * chronological order, in the place-local timezone. An empty (but not absent)
   * value indicates a place that is never open, e.g. because it is closed
   * temporarily for renovations.
   *
   * The starting day of `periods` is NOT fixed and should not be assumed to be
   * Sunday. The API determines the start day based on a variety of factors. For
   * example, for a 24/7 business, the first period may begin on the day of the
   * request. For other businesses, it might be the first day of the week that they
   * are open.
   *
   * NOTE: The ordering of the `periods` array is independent of the ordering of the
   * `weekday_descriptions` array. Do not assume they will begin on the same day.
   */
  periods?: Array<PlaceOpeningHours.Period>;

  /**
   * A type string used to identify the type of secondary hours.
   */
  secondaryHoursType?:
    | "SECONDARY_HOURS_TYPE_UNSPECIFIED"
    | "DRIVE_THROUGH"
    | "HAPPY_HOUR"
    | "DELIVERY"
    | "TAKEOUT"
    | "KITCHEN"
    | "BREAKFAST"
    | "LUNCH"
    | "DINNER"
    | "BRUNCH"
    | "PICKUP"
    | "ACCESS"
    | "SENIOR_HOURS"
    | "ONLINE_SERVICE_HOURS";

  /**
   * Structured information for special days that fall within the period that the
   * returned opening hours cover. Special days are days that could impact the
   * business hours of a place, e.g. Christmas day. Set for current_opening_hours and
   * current_secondary_opening_hours if there are exceptional hours.
   */
  specialDays?: Array<PlaceOpeningHours.SpecialDay>;

  /**
   * Localized strings describing the opening hours of this place, one string for
   * each day of the week.
   *
   * NOTE: The order of the days and the start of the week is determined by the
   * locale (language and region). The ordering of the `periods` array is independent
   * of the ordering of the `weekday_descriptions` array. Do not assume they will
   * begin on the same day.
   *
   * Will be empty if the hours are unknown or could not be converted to localized
   * text. Example: "Sun: 18:00–06:00"
   */
  weekdayDescriptions?: Array<string>;
}

export namespace PlaceOpeningHours {
  /**
   * A period the place remains in open_now status.
   */
  export interface Period {
    /**
     * Status changing points.
     */
    close?: PlacesAPI.PeriodPoint;

    /**
     * Status changing points.
     */
    open?: PlacesAPI.PeriodPoint;
  }

  /**
   * Structured information for special days that fall within the period that the
   * returned opening hours cover. Special days are days that could impact the
   * business hours of a place, e.g. Christmas day.
   */
  export interface SpecialDay {
    /**
     * The date of this special day.
     */
    date?: string;
  }
}

/**
 * Information about a review of a place.
 */
export interface Review {
  /**
   * Information about the author of the UGC data. Used in
   * [Photo][google.maps.places.v1.Photo], and
   * [Review][google.maps.places.v1.Review].
   */
  authorAttribution?: AuthorAttribution;

  /**
   * A link where users can flag a problem with the review.
   */
  flagContentUri?: string;

  /**
   * A link to show the review on Google Maps.
   */
  googleMapsUri?: string;

  /**
   * A reference representing this place review which may be used to look up this
   * place review again (also called the API "resource" name:
   * `places/{place_id}/reviews/{review}`).
   */
  name?: string;

  /**
   * Localized variant of a text in a particular language.
   */
  originalText?: LocalizedText;

  /**
   * Timestamp for the review.
   */
  publishTime?: string;

  /**
   * A number between 1.0 and 5.0, also called the number of stars.
   */
  rating?: number;

  /**
   * A string of formatted recent time, expressing the review time relative to the
   * current time in a form appropriate for the language and country.
   */
  relativePublishTimeDescription?: string;

  /**
   * Localized variant of a text in a particular language.
   */
  text?: LocalizedText;
}

/**
 * A latitude-longitude viewport, represented as two diagonally opposite `low` and
 * `high` points. A viewport is considered a closed region, i.e. it includes its
 * boundary. The latitude bounds must range between -90 to 90 degrees inclusive,
 * and the longitude bounds must range between -180 to 180 degrees inclusive.
 * Various cases include:
 *
 * - If `low` = `high`, the viewport consists of that single point.
 *
 * - If `low.longitude` > `high.longitude`, the longitude range is inverted (the
 *   viewport crosses the 180 degree longitude line).
 *
 * - If `low.longitude` = -180 degrees and `high.longitude` = 180 degrees, the
 *   viewport includes all longitudes.
 *
 * - If `low.longitude` = 180 degrees and `high.longitude` = -180 degrees, the
 *   longitude range is empty.
 *
 * - If `low.latitude` > `high.latitude`, the latitude range is empty.
 *
 * Both `low` and `high` must be populated, and the represented box cannot be empty
 * (as specified by the definitions above). An empty viewport will result in an
 * error.
 *
 * For example, this viewport fully encloses New York City:
 *
 * { "low": { "latitude": 40.477398, "longitude": -74.259087 }, "high": {
 * "latitude": 40.91618, "longitude": -73.70018 } }
 */
export interface Viewport {
  /**
   * An object that represents a latitude/longitude pair. This is expressed as a pair
   * of doubles to represent degrees latitude and degrees longitude. Unless specified
   * otherwise, this must conform to the
   * <a href="http://www.unoosa.org/pdf/icg/2012/template/WGS_84.pdf">WGS84
   * standard</a>. Values must be within normalized ranges.
   */
  high?: LatLng;

  /**
   * An object that represents a latitude/longitude pair. This is expressed as a pair
   * of doubles to represent degrees latitude and degrees longitude. Unless specified
   * otherwise, this must conform to the
   * <a href="http://www.unoosa.org/pdf/icg/2012/template/WGS_84.pdf">WGS84
   * standard</a>. Values must be within normalized ranges.
   */
  low?: LatLng;
}

export interface PlaceRetrieveParams {
  /**
   * Optional. Place details will be displayed with the preferred language if
   * available.
   *
   * Current list of supported languages:
   * https://developers.google.com/maps/faq#languagesupport.
   */
  languageCode?: string;

  /**
   * Optional. The Unicode country/region code (CLDR) of the location where the
   * request is coming from. This parameter is used to display the place details,
   * like region-specific place name, if available. The parameter can affect results
   * based on applicable law. For more information, see
   * https://www.unicode.org/cldr/charts/latest/supplemental/territory_language_information.html.
   *
   * Note that 3-digit region codes are not currently supported.
   */
  regionCode?: string;

  /**
   * Optional. A string which identifies an Autocomplete session for billing
   * purposes. Must be a URL and filename safe base64 string with at most 36 ASCII
   * characters in length. Otherwise an INVALID_ARGUMENT error is returned.
   *
   * The session begins when the user starts typing a query, and concludes when they
   * select a place and a call to Place Details or Address Validation is made. Each
   * session can have multiple queries, followed by one Place Details or Address
   * Validation request. The credentials used for each request within a session must
   * belong to the same Google Cloud Console project. Once a session has concluded,
   * the token is no longer valid; your app must generate a fresh token for each
   * session. If the `session_token` parameter is omitted, or if you reuse a session
   * token, the session is charged as if no session token was provided (each request
   * is billed separately).
   *
   * We recommend the following guidelines:
   *
   * - Use session tokens for all Place Autocomplete calls.
   * - Generate a fresh token for each session. Using a version 4 UUID is
   *   recommended.
   * - Ensure that the credentials used for all Place Autocomplete, Place Details,
   *   and Address Validation requests within a session belong to the same Cloud
   *   Console project.
   * - Be sure to pass a unique session token for each new session. Using the same
   *   token for more than one session will result in each request being billed
   *   individually.
   */
  sessionToken?: string;
}

Places.Photos = Photos;

export declare namespace Places {
  export {
    type AuthorAttribution as AuthorAttribution,
    type ContentBlock as ContentBlock,
    type LatLng as LatLng,
    type LocalizedText as LocalizedText,
    type Money as Money,
    type PeriodPoint as PeriodPoint,
    type Photo as Photo,
    type Place as Place,
    type PlaceOpeningHours as PlaceOpeningHours,
    type Review as Review,
    type Viewport as Viewport,
    type PlaceRetrieveParams as PlaceRetrieveParams,
  };

  export {
    Photos as Photos,
    type PhotoRetrieveMediaResponse as PhotoRetrieveMediaResponse,
    type PhotoRetrieveMediaParams as PhotoRetrieveMediaParams,
  };
}
