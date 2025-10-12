import { countries } from "./countries";

export default {
  failOnUpdate: false,
  defaultValue: "TO CHANGE",
  locales: countries,
  input: ["../../**/*.{ts,js,tsx}"],
  output: "src/i18n/locales/$LOCALE/$NAMESPACE.json",
};
