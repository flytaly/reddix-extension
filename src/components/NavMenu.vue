<script setup lang="ts">
import { useRouter } from 'vue-router'
import PhCircleWavyQuestion from '~icons/ph/circle-wavy-question'
import PhClockCounterClockwiseBold from '~icons/ph/clock-counter-clockwise'
import PhDownloadBold from '~icons/ph/download-bold'
import PhGear from '~icons/ph/gear'
import PhHandHeart from '~icons/ph/hand-heart-duotone'
import PhListBold from '~icons/ph/list-bold'
import PhMagnifyingGlassBold from '~icons/ph/magnifying-glass'
import PhUploadBold from '~icons/ph/upload-bold'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '~/components/ui/navigation-menu'
import { RoutePath } from '~/options/routes'

const items = [
  { label: 'Search', route: RoutePath.Search, iconCmp: PhMagnifyingGlassBold },
  { label: 'Settings', route: RoutePath.Settings, iconCmp: PhGear },
  {
    label: 'Backup',
    iconCmp: PhClockCounterClockwiseBold,
    items: [
      { label: 'Import', route: RoutePath.Import, iconCmp: PhDownloadBold },
      { label: 'Export', route: RoutePath.Export, iconCmp: PhUploadBold },
    ],
  },
  { label: 'Help', route: RoutePath.Help, iconCmp: PhCircleWavyQuestion },
  { label: 'Support', route: RoutePath.Support, iconCmp: PhHandHeart },
]

const router = useRouter()

function navigate(route?: RoutePath) {
  if (route) {
    router.push(route)
  }
}
</script>

<template>
  <div class="sm:hidden">
    <DropdownMenu>
      <DropdownMenuTrigger><PhListBold class="h-5 w-5" /></DropdownMenuTrigger>
      <DropdownMenuContent>
        <template
          v-for="item in items"
          :key="item.label"
        >
          <DropdownMenuItem
            v-if="item.route"
            @click="navigate(item.route)"
          >
            <component :is="item.iconCmp" class="h-4 w-4" />
            <span> {{ item.label }} </span>
          </DropdownMenuItem>
          <DropdownMenuSub
            v-if="item.items"
          >
            <DropdownMenuSubTrigger>
              <component :is="item.iconCmp" class="h-4 w-4 mr-2" />
              <span> {{ item.label }} </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  v-for="subItem in item.items"
                  :key="subItem.label"
                  @click="navigate(subItem.route)"
                >
                  <component :is="subItem.iconCmp" class="h-4 w-4" />
                  <span> {{ subItem.label }} </span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </template>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
  <NavigationMenu class="hidden sm:block">
    <NavigationMenuList>
      <NavigationMenuItem
        v-for="item in items"
        :key="item.label"
        class="font-medium"
      >
        <NavigationMenuLink
          v-if="!item.items" :href="item.route"
          class="flex text-xs md:text-sm items-center flex-row text-surface-500 hover:text-primary-500 dark:text-surface-400 dark:hover:text-primary-400" as-child
        >
          <router-link :to="item.route">
            <component :is="item.iconCmp" class="h-4 w-4 sm:h-5 sm:w-5" />
            <span> {{ item.label }} </span>
          </router-link>
        </NavigationMenuLink>

        <NavigationMenuTrigger
          v-if="item.items"
          class="text-xs md:text-sm text-surface-500 hover:text-primary-500 dark:text-surface-400 dark:hover:text-primary-400 px-2"
        >
          <component :is="item.iconCmp" class="h-4 w-4 sm:h-5 sm:w-5" />
          <span> {{ item.label }} </span>
        </NavigationMenuTrigger>
        <NavigationMenuContent v-if="item.items">
          <ul class="flex flex-col w-30">
            <li v-for="subItem in item.items" :key="subItem.label">
              <NavigationMenuLink :href="subItem.route" class="flex flex-row items-center gap-1 text-xs md:text-sm" as-child>
                <router-link :to="subItem.route">
                  <component :is="subItem.iconCmp" class="h-4 w-4 sm:h-5 sm:w-5" />
                  <span> {{ subItem.label }} </span>
                </router-link>
              </NavigationMenuLink>
            </li>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
</template>
