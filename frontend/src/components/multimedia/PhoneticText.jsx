/** Renderiza la transcripción fonética IPA entre barras. */
export default function PhoneticText({ value }) {
  if (!value) return null;
  return <span className="phonetic">/{value.replace(/^\/|\/$/g, '')}/</span>;
}
