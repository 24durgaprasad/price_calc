import "./globals.css";

export const metadata = { description: "Explore fully customizable home interior designs. Get interiors designed by experts. Book a free consultation.", title: "Price Estimator | HomeLane" };

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
