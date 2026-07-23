/**
 * Renders one JSON-LD block. `<` is escaped to `<` so content containing
 * "</script>" can never break out of the tag (same defence as SchemaInjector).
 * Valid anywhere in the body — crawlers read JSON-LD from body and head alike.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
