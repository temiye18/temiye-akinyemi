/**
 * Renders one or more JSON-LD nodes as a script tag. Server-only; the payload
 * is static structured data from our own content, but `<` is still escaped so a
 * stray `</script>` in copy can never break out of the tag.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
