import { TextField } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <TextField label="Small" size="sm" placeholder="32px" />
      <TextField label="Medium" placeholder="40px" />
      <TextField label="Large" size="lg" placeholder="48px" />
    </>
  );
}
