export const sizes = {
  small: 600,
  medium: 1024,
  large: 1440,
  xlarge: 1920,
};

export const media = (Object.keys(sizes) as Array<keyof typeof sizes>).reduce(
  (acc, size) => {
    acc[size] = () => `@media (min-width:${sizes[size]}px)`;
    return acc;
  },
  {} as { [key in keyof typeof sizes]: () => string },
);
