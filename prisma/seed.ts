import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding pitches...');

  const pitches = [
    { id: 'pitch-1', name: 'Turf Ground',  location: 'Sector 14, Sports Complex', pricePerHour: 500 },
    { id: 'pitch-2', name: 'Box Cricket',  location: 'Sector 8, City Mall Rooftop', pricePerHour: 300 },
    { id: 'pitch-3', name: 'Indoor Nets',  location: 'MG Road, Indoor Sports Arena', pricePerHour: 200 },
  ];

  for (const pitch of pitches) {
    await prisma.pitch.upsert({
      where: { id: pitch.id },
      update: {},
      create: pitch,
    });
    console.log(`  ✅ ${pitch.name}`);
  }

  console.log('🎉 Seed complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
