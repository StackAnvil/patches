/** A CSS custom property name, such as `--index`. */
export type CustomPropertyName = `--${string}`;

declare module "react" {
  /** Lets inline styles pass CSS custom properties to the stylesheet. */
  interface CSSProperties {
    [property: CustomPropertyName]: string | number | undefined;
  }
}
