import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function ProjectInfo () {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card className="w-full max-w-xl sm:max-w-lg md:max-w-md lg:max-w-[50%] shadow-lg">
        <CardContent className="p-10 space-y-7">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center">
            ProdMon
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            За допомогою цього застосунку ви можете відстежувати продуктивність процесора, об'єм оперативної пам'яті,
            отримувати список процесів та надсилати сигнали для завершення процесів. Щоб скористатися даним застосунком,
            спочатку <Link href="/login" className="hover:text-black underline">увійдіть</Link> або <Link
            href="/register" className="hover:text-black underline">створіть обліковий запис</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
