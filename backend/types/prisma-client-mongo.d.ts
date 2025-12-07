declare module '@prisma/client-mongo' {
  // Minimal ambient declaration to silence TypeScript when the generated client
  // is not present. When `prisma generate` has been run this module will provide
  // fully typed exports.
  export const PrismaClient: any;
  export default { PrismaClient: PrismaClient };
}
