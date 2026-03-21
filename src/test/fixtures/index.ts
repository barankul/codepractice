// Golden fixture loader — loads pre-saved practice scenarios for regression testing
import * as fs from "fs";
import * as path from "path";
import { PracticeData } from "../../constants.js";

export interface FixtureVariant {
  label: string;
  code: string;
  output: string;
  expectPass: boolean;
  failReason?: string;
}

export interface GoldenFixture {
  id: string;
  practice: PracticeData;
  solutionCode: string;
  solutionOutput: string;
  meta: string;
  variants: FixtureVariant[];
}

const fixtureDir = path.join(__dirname, "..", "..", "..", "src", "test", "fixtures");

export function loadFixtures(): GoldenFixture[] {
  const files = fs.readdirSync(fixtureDir).filter(f => f.endsWith(".json"));
  return files.map(f => {
    const raw = fs.readFileSync(path.join(fixtureDir, f), "utf8");
    return JSON.parse(raw) as GoldenFixture;
  });
}

export function loadFixture(id: string): GoldenFixture {
  const filePath = path.join(fixtureDir, `${id}.json`);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as GoldenFixture;
}
