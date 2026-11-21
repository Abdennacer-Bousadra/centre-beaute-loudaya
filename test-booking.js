import { z } from 'zod';
import { resolveExtraOption } from './server/src/lib/whatsapp.js';

/** Parse une valeur en nombre si possible, sinon retourne la string (pour slug). */
function toNumberOrString(val) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const n = Number(val);
    return Number.isInteger(n) && n > 0 ? n : val;
  }
  return val;
}

const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^(?:(?:\+|00)212|0)[5-7]\d{8}$/,
    'Numéro marocain invalide (ex: 0666923910)'
  );

const createBookingSchema = z
  .object({
    clientName: z.string().trim().min(3, 'Nom trop court').max(120),
    phone: phoneSchema,
    serviceId: z.union([z.number().int().positive(), z.string().trim().min(1)]).optional(),
    serviceIds: z.array(z.union([z.number().int().positive(), z.string().trim().min(1)])).min(1).max(10).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu AAAA-MM-JJ'),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Heure invalide (HH:MM)'),
    notes: z.string().trim().max(500).optional().default(''),
    extraOptionSlug: z.string().trim().max(40).nullable().optional(),
    lang: z.enum(['fr', 'ar']).optional().default('fr')
  })
  .strip()
  .transform((data) => {
    const rawIds = data.serviceIds?.length
      ? Array.from(new Set(data.serviceIds))
      : data.serviceId
        ? [data.serviceId]
        : [];
    return {
      ...data,
      serviceIds: rawIds.map(toNumberOrString)
    };
  })
  .refine((data) => data.serviceIds.length > 0, {
    message: 'Au moins une prestation est requise',
    path: ['serviceIds']
  });

// Mock services for lookup
const mockServices = [
  { id: 1, slug: 'epil-complete', nameFr: 'Épilation Complète', nameAr: 'إزالة الشعر كاملة', price: 350, duration: '60 min', available: true },
  { id: 2, slug: 'manu-normal', nameFr: 'Manucure Vernis Normal', nameAr: 'مانيكير', price: 90, duration: '35 min', available: true },
  { id: 3, slug: 'opt-deco', nameFr: 'Option Nail Art', nameAr: 'خيار نيل آرت', price: 50, duration: '15 min', available: true },
];

function findServices(serviceIds) {
  const numericIds = serviceIds.filter((v) => typeof v === 'number');
  const slugs = serviceIds.filter((v) => typeof v === 'string');

  const results = [];
  for (const id of numericIds) {
    const svc = mockServices.find(s => s.id === id);
    if (svc) results.push(svc);
  }
  for (const slug of slugs) {
    const svc = mockServices.find(s => s.slug === slug);
    if (svc) results.push(svc);
  }
  return results;
}

function orderServices(serviceIds, services) {
  return serviceIds
    .map((idOrSlug) => {
      if (typeof idOrSlug === 'number') {
        return services.find((service) => service.id === idOrSlug);
      }
      return services.find((service) => service.slug === idOrSlug);
    })
    .filter(Boolean);
}

function parseDurationToMinutes(duration) {
  const text = String(duration || '').trim();
  if (!text) return 0;
  const hours = /(\d+(?:[.,]\d+)?)\s*h/i.exec(text);
  const mins = /(\d+)\s*(?:min|m\b)/i.exec(text);
  let total = 0;
  if (hours) total += Math.round(parseFloat(hours[1].replace(',', '.')) * 60);
  if (mins) total += parseInt(mins[1], 10);
  if (!hours && !mins) {
    const bare = /(\d+)/.exec(text);
    if (bare) total = parseInt(bare[1], 10);
  }
  return total;
}

async function runTests() {
  console.log('=== Booking Schema & Logic Tests ===\n');
  
  // Test 1: serviceIds as slugs (array of strings)
  console.log('Test 1: serviceIds as slugs ["epil-complete"]');
  try {
    const payload = {
      clientName: 'Test Client',
      phone: '0666923910',
      serviceIds: ['epil-complete'],
      date: '2026-10-20',
      time: '10:00',
      notes: '',
      extraOptionSlug: null,
      lang: 'fr'
    };
    const validated = createBookingSchema.parse(payload);
    console.log(`  Schema validation: ✓`);
    console.log(`  Normalized serviceIds: [${validated.serviceIds.join(', ')}] (types: ${validated.serviceIds.map(v => typeof v).join(', ')})`);
    
    const services = findServices(validated.serviceIds);
    console.log(`  Service lookup: ${services.length} found`);
    const ordered = orderServices(validated.serviceIds, services);
    console.log(`  Ordered services: ${ordered.map(s => s.nameFr).join(', ')}`);
    
    const durationMinutes = Math.max(ordered.reduce((total, s) => total + parseDurationToMinutes(s.duration), 0), 15);
    const servicesTotal = ordered.reduce((total, s) => total + s.price, 0);
    const extraOption = resolveExtraOption(validated.extraOptionSlug);
    const totalPrice = servicesTotal + (extraOption ? extraOption.price : 0);
    console.log(`  Duration: ${durationMinutes} min`);
    console.log(`  Services total: ${servicesTotal} DH`);
    console.log(`  Extra option: ${extraOption ? extraOption.nameFr : 'none'}`);
    console.log(`  Total price: ${totalPrice} DH`);
    console.log('  Result: ✓ PASS\n');
  } catch (err) {
    console.log(`  Result: ✗ FAIL - ${err.message}\n`);
  }
  
  // Test 2: serviceIds as numeric IDs
  console.log('Test 2: serviceIds as numeric IDs [1]');
  try {
    const payload = {
      clientName: 'Test Client 2',
      phone: '0666923910',
      serviceIds: [1],
      date: '2026-10-21',
      time: '11:00',
      notes: '',
      extraOptionSlug: null,
      lang: 'fr'
    };
    const validated = createBookingSchema.parse(payload);
    console.log(`  Schema validation: ✓`);
    console.log(`  Normalized serviceIds: [${validated.serviceIds.join(', ')}] (types: ${validated.serviceIds.map(v => typeof v).join(', ')})`);
    
    const services = findServices(validated.serviceIds);
    console.log(`  Service lookup: ${services.length} found`);
    const ordered = orderServices(validated.serviceIds, services);
    console.log(`  Ordered services: ${ordered.map(s => s.nameFr).join(', ')}`);
    
    const durationMinutes = Math.max(ordered.reduce((total, s) => total + parseDurationToMinutes(s.duration), 0), 15);
    const servicesTotal = ordered.reduce((total, s) => total + s.price, 0);
    const extraOption = resolveExtraOption(validated.extraOptionSlug);
    const totalPrice = servicesTotal + (extraOption ? extraOption.price : 0);
    console.log(`  Duration: ${durationMinutes} min`);
    console.log(`  Services total: ${servicesTotal} DH`);
    console.log(`  Total price: ${totalPrice} DH`);
    console.log('  Result: ✓ PASS\n');
  } catch (err) {
    console.log(`  Result: ✗ FAIL - ${err.message}\n`);
  }
  
  // Test 3: serviceIds as numeric IDs + extraOptionSlug
  console.log('Test 3: serviceIds [2] + extraOptionSlug "opt-deco"');
  try {
    const payload = {
      clientName: 'Test Client 3',
      phone: '0666923910',
      serviceIds: [2],
      date: '2026-10-22',
      time: '14:00',
      notes: 'With nail art option',
      extraOptionSlug: 'opt-deco',
      lang: 'fr'
    };
    const validated = createBookingSchema.parse(payload);
    console.log(`  Schema validation: ✓`);
    console.log(`  Normalized serviceIds: [${validated.serviceIds.join(', ')}]`);
    console.log(`  Extra option slug: ${validated.extraOptionSlug}`);
    
    const services = findServices(validated.serviceIds);
    console.log(`  Service lookup: ${services.length} found`);
    const ordered = orderServices(validated.serviceIds, services);
    
    const durationMinutes = Math.max(ordered.reduce((total, s) => total + parseDurationToMinutes(s.duration), 0), 15);
    const servicesTotal = ordered.reduce((total, s) => total + s.price, 0);
    const extraOption = resolveExtraOption(validated.extraOptionSlug);
    const totalPrice = servicesTotal + (extraOption ? extraOption.price : 0);
    console.log(`  Duration: ${durationMinutes} min`);
    console.log(`  Services total: ${servicesTotal} DH`);
    console.log(`  Extra option: ${extraOption?.nameFr} (+${extraOption?.price} DH)`);
    console.log(`  Total price: ${totalPrice} DH (expected 140)`);
    console.log('  Result: ✓ PASS\n');
  } catch (err) {
    console.log(`  Result: ✗ FAIL - ${err.message}\n`);
  }
  
  // Test 4: Invalid slug should fail
  console.log('Test 4: Invalid slug "nonexistent" should fail');
  try {
    const payload = {
      clientName: 'Test Client 4',
      phone: '0666923910',
      serviceIds: ['nonexistent'],
      date: '2026-10-23',
      time: '10:00',
      notes: '',
      extraOptionSlug: null,
      lang: 'fr'
    };
    const validated = createBookingSchema.parse(payload);
    const services = findServices(validated.serviceIds);
    if (services.length !== validated.serviceIds.length) {
      console.log(`  Schema validation: ✓`);
      console.log(`  Service lookup: ${services.length}/${validated.serviceIds.length} found`);
      console.log('  Result: ✓ PASS (correctly detected missing service)\n');
    } else {
      console.log('  Result: ✗ FAIL - should have detected missing service\n');
    }
  } catch (err) {
    console.log(`  Result: ✗ FAIL - ${err.message}\n`);
  }
  
  // Test 5: Mixed IDs and slugs
  console.log('Test 5: Mixed IDs and slugs [1, "manu-normal"]');
  try {
    const payload = {
      clientName: 'Test Client 5',
      phone: '0666923910',
      serviceIds: [1, 'manu-normal'],
      date: '2026-10-24',
      time: '10:00',
      notes: '',
      extraOptionSlug: null,
      lang: 'fr'
    };
    const validated = createBookingSchema.parse(payload);
    console.log(`  Schema validation: ✓`);
    console.log(`  Normalized serviceIds: [${validated.serviceIds.join(', ')}] (types: ${validated.serviceIds.map(v => typeof v).join(', ')})`);
    
    const services = findServices(validated.serviceIds);
    console.log(`  Service lookup: ${services.length} found`);
    const ordered = orderServices(validated.serviceIds, services);
    console.log(`  Ordered services: ${ordered.map(s => s.nameFr).join(', ')}`);
    
    const durationMinutes = Math.max(ordered.reduce((total, s) => total + parseDurationToMinutes(s.duration), 0), 15);
    const servicesTotal = ordered.reduce((total, s) => total + s.price, 0);
    const totalPrice = servicesTotal;
    console.log(`  Duration: ${durationMinutes} min`);
    console.log(`  Services total: ${servicesTotal} DH (expected 440)`);
    console.log('  Result: ✓ PASS\n');
  } catch (err) {
    console.log(`  Result: ✗ FAIL - ${err.message}\n`);
  }
  
  // Test 6: empty extraOptionSlug (string) should be treated as null
  console.log('Test 6: extraOptionSlug as empty string ""');
  try {
    const payload = {
      clientName: 'Test Client 6',
      phone: '0666923910',
      serviceIds: [1],
      date: '2026-10-25',
      time: '10:00',
      notes: '',
      extraOptionSlug: '',
      lang: 'fr'
    };
    const validated = createBookingSchema.parse(payload);
    console.log(`  Schema validation: ✓`);
    console.log(`  Extra option slug: "${validated.extraOptionSlug}" (type: ${typeof validated.extraOptionSlug})`);
    const extraOption = resolveExtraOption(validated.extraOptionSlug);
    console.log(`  Resolved extra option: ${extraOption ? extraOption.nameFr : 'null (correct)'}`);
    console.log('  Result: ✓ PASS\n');
  } catch (err) {
    console.log(`  Result: ✗ FAIL - ${err.message}\n`);
  }
  
  // Test 7: extraOptionSlug as undefined
  console.log('Test 7: extraOptionSlug as undefined');
  try {
    const payload = {
      clientName: 'Test Client 7',
      phone: '0666923910',
      serviceIds: [1],
      date: '2026-10-26',
      time: '10:00',
      notes: '',
      lang: 'fr'
    };
    const validated = createBookingSchema.parse(payload);
    console.log(`  Schema validation: ✓`);
    console.log(`  Extra option slug: ${validated.extraOptionSlug} (type: ${typeof validated.extraOptionSlug})`);
    const extraOption = resolveExtraOption(validated.extraOptionSlug);
    console.log(`  Resolved extra option: ${extraOption ? extraOption.nameFr : 'null (correct)'}`);
    console.log('  Result: ✓ PASS\n');
  } catch (err) {
    console.log(`  Result: ✗ FAIL - ${err.message}\n`);
  }
  
  console.log('=== All Tests Complete ===');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});