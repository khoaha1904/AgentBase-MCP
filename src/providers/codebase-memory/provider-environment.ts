export function providerProcessEnvironment(environment: Readonly<Record<string, string>>): Readonly<Record<string, string>> {
  return {
    ...environment,
    HOME: environment.CBM_CACHE_DIR ?? "",
    LOGNAME: "",
    PATH: "/usr/bin:/bin",
    SHELL: "",
    TERM: "",
    USER: "",
  };
}
