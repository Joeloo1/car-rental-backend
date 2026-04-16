import { prisma } from "../src/config/database";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Start seeding...");

  const categoryNames = ["Sedan", "SUV", "Electric", "Sports", "Luxury", "Convertible", "Truck", "Van"];

  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.upsert({ where: { name }, update: {}, create: { name } })
    )
  );
  console.log(`Created ${categories.length} categories.`);

  const passwordHash = await bcrypt.hash("password123", 12);

  const lendersData = [
    { name: "Sarah Connor", email: "sarah@example.com", role: "lender" as any, isVerified: true, passwordHash },
    { name: "Michael Knight", email: "michael@example.com", role: "lender" as any, isVerified: true, passwordHash },
    { name: "Bruce Wayne", email: "bruce@waynecorp.com", role: "lender" as any, isVerified: true, passwordHash },
    { name: "Tony Stark", email: "tony@starkindustries.com", role: "lender" as any, isVerified: true, passwordHash },
    { name: "Olivia Martinez", email: "olivia@luxurycars.ng", role: "lender" as any, isVerified: true, passwordHash },
  ];

  const lenders = await Promise.all(
    lendersData.map((lender) =>
      prisma.user.upsert({ where: { email: lender.email }, update: {}, create: lender })
    )
  );
  console.log(`Ensured ${lenders.length} lenders exist.`);

  const cat = (name: string) => categories.find((c) => c.name === name)!;

  const carsData = [
    // Electric
    { title: "Tesla Model 3 Performance", brand: "Tesla", model: "Model 3", year: 2023, description: "Fast, sleek, and fully electric. Autopilot, minimalist interior, and instant torque.", pricePerDay: 120, locationCity: "Lagos", category: "Electric", image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80" },
    { title: "Tesla Model S Plaid", brand: "Tesla", model: "Model S", year: 2024, description: "The fastest production car ever made. 0-60 in under 2 seconds.", pricePerDay: 280, locationCity: "Abuja", category: "Electric", image: "https://images.unsplash.com/photo-1619767886558-efdc259b6e09?auto=format&fit=crop&w=800&q=80" },
    { title: "BMW i4 M50", brand: "BMW", model: "i4", year: 2023, description: "Electric performance meets luxury. The perfect daily driver with sports car DNA.", pricePerDay: 200, locationCity: "Lagos", category: "Electric", image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80" },

    // Sports
    { title: "Porsche 911 Carrera GT", brand: "Porsche", model: "911", year: 2023, description: "Iconic sports car with 450hp flat-six engine. Pure driving perfection.", pricePerDay: 450, locationCity: "Lagos", category: "Sports", image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80" },
    { title: "Ferrari Roma", brand: "Ferrari", model: "Roma", year: 2022, description: "La dolce vita in a powerful GT. 620hp, rear-wheel drive, breathtaking style.", pricePerDay: 850, locationCity: "Lekki", category: "Sports", image: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=800&q=80" },
    { title: "Lamborghini Huracán", brand: "Lamborghini", model: "Huracán", year: 2023, description: "Italian supercar with a 631hp V10. An experience like no other.", pricePerDay: 1200, locationCity: "Lagos", category: "Sports", image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=800&q=80" },
    { title: "Honda Civic Type R", brand: "Honda", model: "Civic", year: 2022, description: "Aggressive styling and 315hp turbocharged engine. Track-ready, street-legal.", pricePerDay: 130, locationCity: "Ikeja", category: "Sports", image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80" },
    { title: "Chevrolet Corvette C8", brand: "Chevrolet", model: "Corvette", year: 2023, description: "Mid-engine American supercar. 495hp, 0-60 in 2.9s.", pricePerDay: 380, locationCity: "Abuja", category: "Sports", image: "https://images.unsplash.com/photo-1547744152-14d985cb937f?auto=format&fit=crop&w=800&q=80" },

    // Luxury
    { title: "Mercedes-Benz S-Class S500", brand: "Mercedes", model: "S500", year: 2022, description: "The pinnacle of automotive luxury. Massaging seats, augmented reality HUD.", pricePerDay: 350, locationCity: "Abuja", category: "Luxury", image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80" },
    { title: "Rolls-Royce Ghost", brand: "Rolls-Royce", model: "Ghost", year: 2023, description: "Whisper-quiet cabin, starlight headliner, 563hp V12. The art of travel.", pricePerDay: 1500, locationCity: "Lagos", category: "Luxury", image: "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=800&q=80" },
    { title: "Bentley Continental GT", brand: "Bentley", model: "Continental GT", year: 2023, description: "Handcrafted grand tourer with 626hp twin-turbocharged W12.", pricePerDay: 950, locationCity: "Victoria Island", category: "Luxury", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80" },
    { title: "Audi A8 L", brand: "Audi", model: "A8 L", year: 2023, description: "Long-wheelbase luxury sedan with predictive suspension and rear-seat entertainment.", pricePerDay: 320, locationCity: "Abuja", category: "Luxury", image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80" },

    // SUV
    { title: "Range Rover Sport P530", brand: "Land Rover", model: "Range Rover Sport", year: 2023, description: "Luxury meets off-road supremacy. 530hp, adaptive air suspension.", pricePerDay: 280, locationCity: "Abuja", category: "SUV", image: "https://images.unsplash.com/photo-1606148633261-7bc46700c01b?auto=format&fit=crop&w=800&q=80" },
    { title: "Jeep Wrangler Rubicon 392", brand: "Jeep", model: "Wrangler", year: 2021, description: "The ultimate off-road machine. 470hp V8, removable doors and roof.", pricePerDay: 150, locationCity: "Lekki", category: "SUV", image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80" },
    { title: "BMW X5 M Competition", brand: "BMW", model: "X5 M", year: 2023, description: "627hp performance SUV. Track-day capable, school-run practical.", pricePerDay: 340, locationCity: "Lagos", category: "SUV", image: "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=800&q=80" },
    { title: "Porsche Cayenne GTS", brand: "Porsche", model: "Cayenne GTS", year: 2023, description: "Sport-tuned SUV with 460hp V8. Handles like a sports car, seats five.", pricePerDay: 310, locationCity: "Ikeja", category: "SUV", image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80" },

    // Sedan
    { title: "Toyota Camry Hybrid XSE", brand: "Toyota", model: "Camry", year: 2024, description: "Reliable, fuel-efficient, and stylish. Perfect for business travel.", pricePerDay: 80, locationCity: "Lagos", category: "Sedan", image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80" },
    { title: "Honda Accord Sport", brand: "Honda", model: "Accord", year: 2024, description: "Modern design with turbocharged efficiency. Spacious and tech-packed.", pricePerDay: 75, locationCity: "Ibadan", category: "Sedan", image: "https://images.unsplash.com/photo-1568844293986-ca9c5b63f4fd?auto=format&fit=crop&w=800&q=80" },
    { title: "Mercedes-Benz C300", brand: "Mercedes", model: "C300", year: 2023, description: "Entry to Mercedes luxury. Elegant cabin, turbocharged performance.", pricePerDay: 180, locationCity: "Abuja", category: "Sedan", image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80" },

    // Convertible
    { title: "Porsche 911 Cabriolet", brand: "Porsche", model: "911 Cabriolet", year: 2023, description: "Drop-top driving pleasure with 379hp. Wind in your hair, smile on your face.", pricePerDay: 500, locationCity: "Lagos", category: "Convertible", image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80" },
    { title: "BMW M4 Competition Convertible", brand: "BMW", model: "M4", year: 2022, description: "503hp open-top sports sedan. The most hardcore M car ever made.", pricePerDay: 420, locationCity: "Lekki", category: "Convertible", image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80" },

    // Truck
    { title: "Ford F-150 Raptor R", brand: "Ford", model: "F-150 Raptor R", year: 2023, description: "700hp supercharged V8 pickup. Conquer any terrain with unprecedented power.", pricePerDay: 210, locationCity: "Abuja", category: "Truck", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80" },
    { title: "Toyota Hilux Legend", brand: "Toyota", model: "Hilux", year: 2023, description: "Unbreakable workhorse. Proven reliability across Africa's toughest roads.", pricePerDay: 95, locationCity: "Kano", category: "Truck", image: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=800&q=80" },

    // Van
    { title: "Mercedes-Benz V-Class", brand: "Mercedes", model: "V-Class", year: 2023, description: "Luxury travel for groups. Premium leather for 7 passengers.", pricePerDay: 220, locationCity: "Lagos", category: "Van", image: "https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?auto=format&fit=crop&w=800&q=80" },

    // More Electric
    { title: "Rivian R1T Launch Edition", brand: "Rivian", model: "R1T", year: 2023, description: "The ultimate electric adventure vehicle. Quad-motor, 835hp, goes anywhere.", pricePerDay: 250, locationCity: "Abuja", category: "Electric", image: "https://images.unsplash.com/photo-1632766068228-cb54e3d36cd4?auto=format&fit=crop&w=800&q=80" },
    { title: "Hyundai Ioniq 5 N", brand: "Hyundai", model: "Ioniq 5", year: 2024, description: "Track-ready electric crossover that defies expectations. 641hp of pure fun.", pricePerDay: 190, locationCity: "Lagos", category: "Electric", image: "https://images.unsplash.com/photo-1662450346146-24e5d59013e8?auto=format&fit=crop&w=800&q=80" },

    // More Sports
    { title: "McLaren 720S", brand: "McLaren", model: "720S", year: 2022, description: "Supercar with alien-like aesthetics and mind-bending performance. 710hp twin-turbo V8.", pricePerDay: 1300, locationCity: "Victoria Island", category: "Sports", image: "https://images.unsplash.com/photo-1620882813876-02e078a6358c?auto=format&fit=crop&w=800&q=80" },
    { title: "Aston Martin Vantage", brand: "Aston Martin", model: "Vantage", year: 2023, description: "British elegance meets raw power. A true predator on the road.", pricePerDay: 800, locationCity: "Lekki", category: "Sports", image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80" },

    // More Luxury
    { title: "Maserati Quattroporte", brand: "Maserati", model: "Quattroporte", year: 2023, description: "Italian flagship sedan with a soul-stirring exhaust note and opulent interior.", pricePerDay: 600, locationCity: "Abuja", category: "Luxury", image: "https://images.unsplash.com/photo-1610444321743-162e0a29f8f4?auto=format&fit=crop&w=800&q=80" },

    // More SUV
    { title: "Mercedes-Maybach GLS 600", brand: "Mercedes", model: "GLS 600", year: 2024, description: "The peak of SUV luxury. First-class rear seats, boundless comfort.", pricePerDay: 1100, locationCity: "Lagos", category: "SUV", image: "https://images.unsplash.com/photo-1594966779313-e7a9bb3142da?auto=format&fit=crop&w=800&q=80" },

    // More Sedan
    { title: "BMW M5 Competition", brand: "BMW", model: "M5", year: 2023, description: "The benchmark super sedan. 617hp, AWD capability, business class comfort.", pricePerDay: 350, locationCity: "Lekki", category: "Sedan", image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80" },

    // More Convertible
    { title: "Ferrari Portofino M", brand: "Ferrari", model: "Portofino M", year: 2023, description: "Retractable hardtop for open-air grand touring. Pure Italian magic.", pricePerDay: 950, locationCity: "Victoria Island", category: "Convertible", image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80" },

    // More Truck
    { title: "GMC Hummer EV Pickup", brand: "GMC", model: "Hummer EV", year: 2024, description: "1,000hp supertruck. Crab mode, extreme capability, zero emissions.", pricePerDay: 400, locationCity: "Abuja", category: "Truck", image: "https://images.unsplash.com/photo-1629897042531-ad6e59ad768a?auto=format&fit=crop&w=800&q=80" },

    // More Van
    // More Van
    { title: "Volkswagen ID. Buzz", brand: "Volkswagen", model: "ID. Buzz", year: 2024, description: "Retro-modern all-electric van. Perfect for eco-friendly group travel.", pricePerDay: 180, locationCity: "Lagos", category: "Van", image: "https://images.unsplash.com/photo-1659550731093-61bba1033230?auto=format&fit=crop&w=800&q=80" },

    // Additional New Cars
    { title: "Lexus LC 500", brand: "Lexus", model: "LC 500", year: 2023, description: "Stunning coupe with a naturally aspirated V8. Pure auditory bliss.", pricePerDay: 400, locationCity: "Abuja", category: "Luxury", image: "https://images.unsplash.com/photo-1623910382367-eafa04e7b8a7?auto=format&fit=crop&w=800&q=80" },
    { title: "Audi RS e-tron GT", brand: "Audi", model: "RS e-tron GT", year: 2024, description: "All-electric performance grand tourer. Striking design with supercar speed.", pricePerDay: 350, locationCity: "Victoria Island", category: "Electric", image: "https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?auto=format&fit=crop&w=800&q=80" },
    { title: "Alfa Romeo Giulia Quadrifoglio", brand: "Alfa Romeo", model: "Giulia", year: 2023, description: "Italian driving passion in a four-door sedan. Ferrari-derived V6 engine.", pricePerDay: 280, locationCity: "Lekki", category: "Sedan", image: "https://images.unsplash.com/photo-1622394595232-a52cfde10972?auto=format&fit=crop&w=800&q=80" },
    { title: "Jaguar F-Type R", brand: "Jaguar", model: "F-Type R", year: 2022, description: "Roaring V8 coupe with dramatic British styling. A timeless sports car.", pricePerDay: 320, locationCity: "Lagos", category: "Sports", image: "https://images.unsplash.com/photo-1598457002018-c2b3e404b901?auto=format&fit=crop&w=800&q=80" },
    { title: "Land Rover Defender 110", brand: "Land Rover", model: "Defender", year: 2023, description: "Iconic off-roader reimagined. Tough, commanding, and infinitely capable.", pricePerDay: 260, locationCity: "Ikeja", category: "SUV", image: "https://images.unsplash.com/photo-1605350383186-b48cde070c53?auto=format&fit=crop&w=800&q=80" }
  ];

  let created = 0;
  for (let i = 0; i < carsData.length; i++) {
    const data = carsData[i];
    const category = cat(data.category);
    const lender = lenders[i % lenders.length];

    // Check if car already exists to avoid duplicates
    const exists = await prisma.car.findFirst({ where: { title: data.title } });
    if (exists) { console.log(`Skipping existing: ${data.title}`); continue; }

    await prisma.car.create({
      data: {
        title: data.title,
        brand: data.brand,
        model: data.model,
        year: data.year,
        description: data.description,
        pricePerDay: data.pricePerDay,
        locationCity: data.locationCity,
        categoryId: category.id,
        lenderId: lender.id,
        images: {
          create: [{ imageUrl: data.image, isMain: true, publicId: `seed_${i}` }],
        },
      },
    });
    created++;
    console.log(`✅ Created: ${data.title}`);
  }

  console.log(`\n🎉 Seeding finished. ${created} new cars created.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
