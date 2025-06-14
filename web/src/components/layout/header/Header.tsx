import * as React from 'react';

import {
  NavigationMenu, NavigationMenuLink,
  NavigationMenuItem,
  NavigationMenuList, navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import Image from 'next/image';
import AuthButton from '@/components/layout/header/AuthButton';
import Link from 'next/link';

export default function Header () {
  return (
    <header className="flex items-center justify-between w-full px-6 bg-white shadow-md sticky top-0 z-50 pb-2 pt-2">
      <div className="relative w-[100px] sm:w-[150px] sm:h-[64px] md:w-[250px] lg:w-[300px] min-w-[100px] min-h-[48px]">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Stone Store Logo"
            fill
            priority
            className="object-contain"
          />
        </Link>
      </div>
      <NavigationMenu className="mr-[3%]">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
            >
              <AuthButton/>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
}
