// prisma/seed.ts
import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Super Admin
  const hashedPassword = await bcrypt.hash('admin123', 12)

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@wifiportal.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@wifiportal.com',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
    },
  })
  console.log('✅ Super Admin created:', superAdmin.email)

  // Demo Company
  const company = await prisma.company.upsert({
    where: { slug: 'mercado-demo' },
    update: {},
    create: {
      name: 'Mercado Bom Preço',
      slug: 'mercado-demo',
      primaryColor: '#FF6B35',
      secondaryColor: '#1A1A2E',
      accentColor: '#FF9500',
      pageTitle: 'Wi-Fi Gratuito - Mercado Bom Preço',
      welcomeText: 'Conecte-se gratuitamente e aproveite nossas ofertas!',
      footerText: 'Ao conectar, você concorda com nossa política de privacidade.',
      postLoginRedirectUrl: 'https://mercadobompreco.com.br/promocoes',
      lgpdEnabled: true,
      lgpdText: 'Concordo com a Política de Privacidade e uso dos meus dados para comunicações da empresa.',
      active: true,
    },
  })
  console.log('✅ Demo company created:', company.name)

  // Company Admin
  const companyAdmin = await prisma.user.upsert({
    where: { email: 'gerente@mercadobompreco.com' },
    update: {},
    create: {
      name: 'Gerente Mercado',
      email: 'gerente@mercadobompreco.com',
      password: await bcrypt.hash('gerente123', 12),
      role: UserRole.COMPANY_ADMIN,
      companyId: company.id,
    },
  })
  console.log('✅ Company admin created:', companyAdmin.email)

  // Demo Campaign
  const campaign = await prisma.campaign.create({
    data: {
      companyId: company.id,
      name: 'Ofertas da Semana',
      description: 'As melhores ofertas selecionadas para você!',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      active: true,
      promotions: {
        create: [
          {
            title: 'Picanha Bovina',
            description: 'Picanha bovina premium — de R$ 65,00 por apenas R$ 49,90/kg',
            sortOrder: 1,
            active: true,
          },
          {
            title: 'Frango Inteiro',
            description: 'Frango inteiro congelado — de R$ 18,00 por R$ 12,90/kg',
            sortOrder: 2,
            active: true,
          },
        ],
      },
    },
  })
  console.log('✅ Demo campaign created:', campaign.name)

  console.log('\n🎉 Seed completed!')
  console.log('\n📋 Credentials:')
  console.log('  Super Admin: admin@wifiportal.com / admin123')
  console.log('  Company Admin: gerente@mercadobompreco.com / gerente123')
  console.log('\n🌐 Portal URL: /portal/mercado-demo')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
