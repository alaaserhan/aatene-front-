import Image from "next/image";

const icons = {
  nav: ["nav-sparkles.svg", 20, 20],
  sparkles: ["3acbe.svg", 24, 24],
  entry: ["080b6.svg", 24, 24],
  change: ["98e24.svg", 14, 14],
  breadcrumb: ["3b7e5.svg", 14, 14],
  arrow: ["ccc42.svg", 20, 20],
  close: ["fc976.svg", 20, 20],
  badge: ["71cc1.svg", 16, 16],
  generate: ["f6597.svg", 18, 18],
  results: ["be194.svg", 32, 32],
  info: ["0a65a.svg", 24, 24],
  depleted: ["79090.svg", 24, 24],
  packageSelected: ["01923.svg", 16, 16],
  packageUnselected: ["02967.svg", 16, 16],
  paymentArrow: ["a185a.svg", 16, 16],
  paymentLock: ["b0c86.svg", 14, 14],
  trash: ["76201.svg", 18, 18],
  upload: ["1a523.svg", 20, 20],
  photo: ["04e2f.svg", 45, 45],
  hanger: ["9b988.svg", 42, 42],
  share: ["20368.svg", 20, 20],
  download: ["a85df.svg", 20, 20],
  view: ["84bc5.svg", 16, 16],
  clock: ["b4508.svg", 16, 16],
  previous: ["f6101.svg", 16, 16],
  next: ["3f5e3.svg", 16, 16],
  settings: ["a4e9c.svg", 18, 18],
} as const;

export function TryOnIcon({ name }: { name: keyof typeof icons }) {
  const [file, width, height] = icons[name];
  return <Image src={`/virtual-try-on/${file}`} alt="" width={width} height={height} unoptimized aria-hidden="true" className="shrink-0" />;
}
