import * as fs from 'fs';
import * as path from 'path';
import mongoose, { Types } from 'mongoose';
import type { MigrationReport } from './migrate-profile-certificates';

const REPORT_PATH = path.resolve(
  __dirname,
  '../../../../certifications-migration-report.json',
);

function loadLocalEnv(): void {
  const envPath = path.resolve(__dirname, '../../../../.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    if (!key || process.env[key] !== undefined) continue;
    process.env[key] = line
      .slice(separator + 1)
      .trim()
      .replace(/(^["']|["']$)/g, '');
  }
}

export async function rollbackProfileCertificates(
  apply: boolean,
): Promise<{ matchedCount: number; deletedCount: number; ids: string[] }> {
  if (!apply) throw new Error('Rollback يتطلب --apply صراحة');
  if (!fs.existsSync(REPORT_PATH)) {
    throw new Error('تقرير الترحيل غير موجود');
  }
  const report = JSON.parse(
    fs.readFileSync(REPORT_PATH, 'utf8'),
  ) as MigrationReport;
  const ids = report.mapping
    .filter((item) => item.createdInThisRun && item.certificationId)
    .map((item) => item.certificationId!)
    .filter((id) => Types.ObjectId.isValid(id));
  if (!ids.length) return { matchedCount: 0, deletedCount: 0, ids: [] };

  loadLocalEnv();
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI غير مضبوط');
  await mongoose.connect(uri);
  try {
    const collection = mongoose.connection.db?.collection('certifications');
    if (!collection) throw new Error('تعذر الوصول إلى مجموعة certifications');
    const objectIds = ids.map((id) => new Types.ObjectId(id));
    const matchedCount = await collection.countDocuments({
      _id: { $in: objectIds },
    });
    const result = await collection.deleteMany({ _id: { $in: objectIds } });
    return { matchedCount, deletedCount: result.deletedCount, ids };
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  void rollbackProfileCertificates(process.argv.slice(2).includes('--apply'))
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
