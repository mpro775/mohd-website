import Image from "next/image";

export function ProjectGallery({ title, images }: { title: string; images: string[] }) {
  if (!images.length) return null;
  return (
    <section className="premium-card p-6">
      <h2 className="mb-5 text-xl font-bold text-foreground">Gallery</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {images.slice(0, 6).map((image, index) => (
          <div key={image} className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
            <Image src={image} alt={`${title} - ${index + 1}`} fill className="object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}
