<?php

namespace App\DataFixtures;

use App\DTO\OrderSeedDTO;
use App\Entity\Block;
use App\Entity\Driver;
use App\Entity\Product;
use App\Enum\OrderStatus;
use App\Factory\OrderFactory;
use DateTimeImmutable;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    private readonly OrderFactory $orderFactory;

    public function __construct(OrderFactory $orderFactory)
    {
        $this->orderFactory = $orderFactory;
    }

    public function load(ObjectManager $manager): void
    {
        $this->seedDrivers($manager);
        $this->seedBlocks($manager);
        $this->seedProducts($manager);

        $orders = $this->getOrderDTOs();
        $this->seedOrders($manager, $orders);

        $manager->flush();
    }

    private function seedDrivers(ObjectManager $manager): void
    {
        $drivers = [
            'driver_juan' => new Driver('Juan', 'Pérez', 'ABC-123', new DateTimeImmutable('1990-05-12')),
            'driver_maria' => new Driver('María', 'González', 'XYZ-789', new DateTimeImmutable('1987-11-03')),
            'driver_carlos' => new Driver('Carlos', 'Ramírez', 'JKL-456', new DateTimeImmutable('1995-02-21')),
        ];

        foreach ($drivers as $ref => $driver) {
            $manager->persist($driver);
            $this->addReference($ref, $driver);
        }
    }

    private function seedBlocks(ObjectManager $manager): void
    {
        $blocks = [
            'block_centro' => (new Block('Centro'))->setDescription('Zona céntrica de la ciudad'),
            'block_norte' => (new Block('Norte'))->setDescription('Sector norte, cercano a la autopista'),
            'block_sur' => (new Block('Sur'))->setDescription('Sector sur, área industrial'),
        ];

        foreach ($blocks as $ref => $block) {
            $manager->persist($block);
            $this->addReference($ref, $block);
        }
    }

    private function seedProducts(ObjectManager $manager): void
    {
        $products = [
            'prod_cafe' => (new Product('Café molido', 'CAF-001')),
            'prod_azucar' => (new Product('Azúcar blanca', 'AZU-002')),
            'prod_arroz' => (new Product('Arroz premium', 'ARR-003')),
            'prod_harina' => (new Product('Harina de trigo', 'HAR-004')),
        ];

        foreach ($products as $ref => $product) {
            $manager->persist($product);
            $this->addReference($ref, $product);
        }
    }

    /**
     * @return OrderSeedDTO[]
     */
    private function getOrderDTOs(): array
    {
        $now = new DateTimeImmutable('now');

        return [
            new OrderSeedDTO(
                code: 'PED-1201',
                origin: 'Bodega Central',
                destination: 'Supermercado La Estrella',
                latitude: '19.432608',
                longitude: '-99.133209',
                dispatchDate: $now->modify('+1 day'),
            ),
            new OrderSeedDTO(
                code: 'PED-3402',
                origin: 'Planta Norte',
                destination: 'Tienda Don Pepe',
                latitude: '19.451234',
                longitude: '-99.120001',
                dispatchDate: $now->modify('+4 day'),
            ),
            new OrderSeedDTO(
                code: 'PED-3303',
                origin: 'Bodega Sur',
                destination: 'Mercado San Juan',
                latitude: '19.451234',
                longitude: '-99.120001',
                dispatchDate: $now->modify('+6 days'),
                volume: '1.22',
                weight: '44.00',
                incidents: 'Pendiente de autorización',
                numberOfBags: 4,
                status: OrderStatus::PENDING,
                productRefs: ['prod_harina', 'prod_azucar']
            ),
            new OrderSeedDTO(
                code: 'PED-2354',
                origin: 'Centro de distribución',
                destination: 'Farmacia La Salud',
                latitude: '19.410000',
                longitude: '-99.140000',
                dispatchDate: $now->modify('+3 days'),
                volume: '0.33',
                weight: '40.00',
                incidents: null,
                numberOfBags: 3,
                status: OrderStatus::COMPLETED,
                driverRef: 'driver_juan',
                productRefs: ['prod_cafe']
            ),
            new OrderSeedDTO(
                code: 'PED-2315',
                origin: 'Planta Norte',
                destination: 'Restaurante El Buen Sabor',
                latitude: '19.460500',
                longitude: '-99.110500',
                dispatchDate: $now,
                volume: '3.10',
                weight: '200.00',
                incidents: null,
                numberOfBags: 12,
                status: OrderStatus::COMPLETED,
                driverRef: 'driver_maria',
                productRefs: ['prod_arroz', 'prod_harina']
            ),
            new OrderSeedDTO(
                code: 'PED-4426',
                origin: 'Bodega Central',
                destination: 'Tienda Abarrotes Lupita',
                latitude: '19.430100',
                longitude: '-99.130900',
                dispatchDate: $now->modify('+6 hours'),
                user: 'operador2',
                volume: '1.00',
                weight: '65.00',
                incidents: null,
                numberOfBags: 5,
                status: OrderStatus::READY_TO_SHIP,
                driverRef: 'driver_carlos',
                productRefs: ['prod_azucar']
            ),
            new OrderSeedDTO(
                code: 'PED-0007',
                origin: 'Centro de distribución',
                destination: 'Supermercado El Triunfo',
                latitude: '19.420000',
                longitude: '-99.150000',
                dispatchDate: $now->modify('+12 hours'),
                user: 'admin',
                volume: '2.00',
                weight: '120.00',
                incidents: null,
                numberOfBags: 8,
                status: OrderStatus::READY_TO_SHIP,
                driverRef: 'driver_juan',
                productRefs: ['prod_cafe', 'prod_arroz']
            ),
            new OrderSeedDTO(
                code: 'PED-2011',
                origin: 'Bodega Sur',
                destination: 'Mini Súper La Palma',
                latitude: '19.415000',
                longitude: '-99.145000',
                dispatchDate: $now->modify('-2 days'),
                user: 'operador4',
                volume: '0.50',
                weight: '30.00',
                incidents: 'Entrega realizada sin novedades',
                numberOfBags: 2,
                status: OrderStatus::APPROVED,
                driverRef: 'driver_maria',
                blockRef: 'block_sur',
                productRefs: ['prod_harina']
            ),
            new OrderSeedDTO(
                code: 'PED-0559',
                origin: 'Centro de distribución',
                destination: 'Plataforma de Ventas y Marcas',
                latitude: '12.889902',
                longitude: '-39.235000',
                dispatchDate: $now->modify('-2 days'),
                user: 'operador4',
                volume: '0.50',
                weight: '30.00',
                incidents: 'Entrega realizada sin novedades',
                numberOfBags: 2,
                status: OrderStatus::APPROVED,
                driverRef: 'driver_maria',
                blockRef: 'block_norte',
                productRefs: ['prod_harina', 'prod_cafe', 'prod_arroz']
            ),
            new OrderSeedDTO(
                code: 'PED-0302',
                origin: 'Bodega Sur',
                destination: 'Pati y Juno',
                latitude: '19.415000',
                longitude: '-99.145000',
                dispatchDate: $now->modify('-2 days'),
                user: 'operador4',
                volume: '0.50',
                weight: '30.00',
                incidents: 'Entrega con problemas en productos rotos. Queja enviada',
                numberOfBags: 2,
                status: OrderStatus::REJECTED,
                driverRef: 'driver_maria',
                blockRef: 'block_centro',
                productRefs: ['prod_harina']
            ),
            new OrderSeedDTO(
                code: 'PED-0018',
                origin: 'Bodega Oeste',
                destination: 'Mini Bar Dani',
                latitude: '16.222300',
                longitude: '-98.235000',
                dispatchDate: $now->modify('-2 days'),
                user: 'operador4',
                volume: '0.50',
                weight: '30.00',
                incidents: 'Entrega realizada sin novedades',
                numberOfBags: 2,
                status: OrderStatus::DELIVERED,
                driverRef: 'driver_maria',
                blockRef: 'block_norte',
                productRefs: ['prod_harina']
            ),
            new OrderSeedDTO(
                code: 'PED-0028',
                origin: 'Bodega Radar',
                destination: 'Mini Tienda La Palma',
                latitude: '19.225000',
                longitude: '-99.557200',
                dispatchDate: $now->modify('-2 days'),
                user: 'operador22',
                volume: '0.50',
                weight: '30.00',
                incidents: 'Entrega realizada sin novedades',
                numberOfBags: 2,
                status: OrderStatus::DELIVERED,
                driverRef: 'driver_maria',
                blockRef: 'block_norte',
                productRefs: ['prod_harina']
            ),
        ];
    }

    /**
     * @param ObjectManager $manager
     * @param OrderSeedDTO[] $orders
     */
    private function seedOrders(ObjectManager $manager, array $orders): void
    {
        foreach ($orders as $dto) {
            $driver = $dto->driverRef ? $this->getReference($dto->driverRef, Driver::class) : null;
            $block = $dto->blockRef ? $this->getReference($dto->blockRef, Block::class) : null;
            $products = array_map(fn(string $ref) => $this->getReference($ref, Product::class), $dto->productRefs);

            $order = $this->orderFactory->createFromDTO(
                $dto,
                $driver instanceof Driver ? $driver : null,
                $block instanceof Block ? $block : null,
                array_filter($products, fn($p) => $p instanceof Product)
            );

            $manager->persist($order);
        }
    }
}
