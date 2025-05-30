import type { Config } from "tailwindcss";
import type { Levels } from "./src/components/headline";
import type { BuenType } from "./src/lib/buen-type/generateBuenType";

const defaultTheme = require("tailwindcss/defaultTheme");

const {
  generateBuenTypeCustomProperties,
  generateBuenType,
} = require("./src/lib/buen-type/"); // Adjust the path as needed

const buenTypePlugin = function ({ addUtilities }: any) {
  const fluidTypeStyles = generateBuenType({
    levels: ["sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl"] as string[] &
      Levels,
    maxRatio: 1.3,
    minRatio: 1.2,
  }) as BuenType;
  const customProperties = generateBuenTypeCustomProperties(fluidTypeStyles);

  const utilities = {} as any;

  for (const [property, value] of Object.entries(customProperties)) {
    utilities[`.${property}`] = {
      "--buen-font-size": value,
    };
  }

  for (const [level, fontSize] of Object.entries(fluidTypeStyles)) {
    const letterSpacing = () => {
      if (level === "sm") return "0";
      if (level === "md") return "0";
      return "-0.02em";
    };

    utilities[`.text-buen-${level}`] = {
      fontSize,
      lineHeight: 1,
      letterSpacing: letterSpacing(),
    };
  }

  addUtilities(utilities, ["responsive", "hover"]);
};

const colors = {
  primary: {
    DEFAULT: "rgb(25, 67, 245)",
    50: "rgba(25, 67, 245, 0.5)",
  },
  primaryLight: {
    DEFAULT: "rgba(223, 229, 255, 0.68)",
  },
  secondary: {
    DEFAULT: "rgb(98, 238, 212)",
    50: "rgba(98, 238, 212, 0.5)",
  },
  secondaryLight: {
    DEFAULT: "rgba(217, 237, 242, 0.8)",
  },
  tertiary: {
    DEFAULT: "rgb(231, 231, 231)",
    50: "rgba(231, 231, 231, 0.5)",
    10: "rgba(231, 231, 231, 0.1)",
  },
  tertiaryLight: {
    DEFAULT: "rgb(22, 22, 22)",
    50: "rgba(22, 22, 22, 0.5)",
    10: "rgba(22, 22, 22, 0.1)",
  },
  red: {
    DEFAULT: "rgb(255, 0, 0)",
    50: "rgba(255, 0, 0, 0.5)",
  },
  ground: {
    DEFAULT: "rgb(237, 238, 248)",
    50: "rgba(237, 238, 248, 0.5)",
  },
  white: {
    DEFAULT: "rgb(255, 255, 255)",
    50: "rgba(255, 255, 255, 0.5)",
  },
};

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [buenTypePlugin],
  theme: {
    colors: {
      ...colors,
      dark: colors,
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px",
      "3xl": "1920px",
      "4xl": "2560px",
    },
    extend: {
      fontFamily: {
        sans: ["futura-pt", ...defaultTheme.fontFamily.sans],
        inter: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        rulik: ["var(--font-rulik)", ...defaultTheme.fontFamily.serif],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  darkMode: "media",
};
export default config;
