import { getTime } from "./video";

test("should render duration", () => {
  expect(getTime()).toBe("00:00");
  expect(getTime("azert")).toBe("00:00");
  expect(getTime("PT")).toBe("00:00");
  expect(getTime("PT1H2M3S")).toBe("1:02:03");
  expect(getTime("PT2M3S")).toBe("02:03");
  expect(getTime("PT3S")).toBe("00:03");
  expect(getTime("PT123H22M33S")).toBe("123:22:33");
  expect(getTime("PT22M33S")).toBe("22:33");
  expect(getTime("PT33S")).toBe("00:33");
});
