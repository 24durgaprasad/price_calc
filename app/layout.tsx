export const metadata = { description: "Explore fully customizable home interior designs. Get interiors designed by experts. Book a free consultation.", title: "Price Estimator | HomeLane" };

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>{children}</body>
    </html>
  );
}
