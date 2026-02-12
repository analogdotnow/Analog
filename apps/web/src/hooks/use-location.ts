import {
  useMutation,
  useQuery,
  type UseMutationOptions,
} from "@tanstack/react-query";

interface Coordinates {
  latitude: number;
  longitude: number;
}

async function checkPermissionStatus() {
  const result = await navigator.permissions.query({ name: "geolocation" });

  return result.state;
}

async function requestPermission() {
  if (!navigator.geolocation) {
    throw new Error("Geolocation is not supported by this browser");
  }

  return new Promise<PermissionState>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      () => resolve("granted"),
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          resolve("denied");
        } else {
          resolve("prompt");
        }
      },
      { timeout: 10000 },
    );
  });
}

async function getLocation(enableHighAccuracy: boolean): Promise<Coordinates> {
  if (!navigator.geolocation) {
    throw new Error("Geolocation is not supported by this browser");
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy,
      timeout: 10000,
      maximumAge: 0,
    }),
  );

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

interface UseLocationPermissionStatusOptions {
  enabled?: boolean;
}

export function useLocationPermissionStatus({
  enabled = true,
}: UseLocationPermissionStatusOptions = {}) {
  return useQuery({
    queryKey: ["location-permission-status"],
    queryFn: checkPermissionStatus,
    enabled,
    staleTime: Infinity,
    retry: false,
  });
}

type RequestLocationPermissionOptions<TContext = unknown> = Omit<
  UseMutationOptions<PermissionState, Error, void, TContext>,
  "mutationFn"
>;

export function useRequestLocationPermission<TContext = unknown>(
  options?: RequestLocationPermissionOptions<TContext>,
) {
  return useMutation({
    ...options,
    mutationFn: requestPermission,
  });
}

interface UseLocationOptions {
  enabled?: boolean;
  enableHighAccuracy?: boolean;
}

export function useLocation({
  enabled = false,
  enableHighAccuracy = true,
}: UseLocationOptions = {}) {
  return useQuery({
    queryKey: ["location", enableHighAccuracy],
    queryFn: () => getLocation(enableHighAccuracy),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}
