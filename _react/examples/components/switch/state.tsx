import { Switch } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Switch>Off</Switch>
      <Switch defaultChecked>On</Switch>
      <Switch disabled>Disabled</Switch>
      <Switch defaultChecked disabled>Disabled on</Switch>
    </>
  );
}
