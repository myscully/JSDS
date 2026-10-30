import { Accordion } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Accordion size="sm" title="Small" style={{ maxWidth: 560 }}>헤더 40 · 제목 14</Accordion>
      <Accordion size="md" title="Medium" style={{ maxWidth: 560 }}>헤더 52 · 제목 16</Accordion>
      <Accordion size="lg" title="Large" style={{ maxWidth: 560 }}>헤더 60 · 제목 18</Accordion>
    </>
  );
}
