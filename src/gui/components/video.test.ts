import { getTimeDisplay } from "src/utils/utils";

test("should render duration", () => {
  expect(getTimeDisplay()).toBe("00:00");
  expect(getTimeDisplay("azert")).toBe("00:00");
  expect(getTimeDisplay("PT")).toBe("00:00");
  expect(getTimeDisplay("PT1H2M3S")).toBe("1:02:03");
  expect(getTimeDisplay("PT2M3S")).toBe("02:03");
  expect(getTimeDisplay("PT3S")).toBe("00:03");
  expect(getTimeDisplay("PT123H22M33S")).toBe("123:22:33");
  expect(getTimeDisplay("PT22M33S")).toBe("22:33");
  expect(getTimeDisplay("PT33S")).toBe("00:33");
});
