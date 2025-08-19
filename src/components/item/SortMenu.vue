<script setup lang="ts">
import type { SearchQuery } from '~/logic/db/queries'
import PhList from '~icons/ph/list'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { inputsStorage } from '~/logic/browser-storage'
import { search } from '~/logic/search-store'

function setSortDirection(dir: SearchDirection) {
  search.direction = dir
  inputsStorage.value.sortDirection = dir
}

function setSortBy(sortBy: SearchQuery['sortBy']) {
  search.sortBy = sortBy
  inputsStorage.value.sortBy = sortBy
}

const itemClass = 'group flex w-full items-center gap-1 '
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger title="sort items">
      <div class="btn text-sm">
        <ph-sort-descending v-if="search.direction === 'desc'" />
        <ph-sort-ascending v-else />
      </div>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuGroup>
        <DropdownMenuLabel>Direction</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem :class="itemClass" @click="setSortDirection('asc')">
          <ph-sort-ascending
            class="group-focus:text-accent-foreground"
            :class="{ 'text-primary-500 dark:text-primary-400': search.direction === 'asc' }"
          />
          asc
        </DropdownMenuItem>
        <DropdownMenuItem :class="itemClass" @click="setSortDirection('desc')">
          <ph-sort-descending
            class="group-focus:text-accent-foreground"
            :class="{ 'text-primary-500 dark:text-primary-400': search.direction === 'desc' }"
          />
          desc
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuGroup>
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuItem :class="itemClass" @click="setSortBy('id')">
          <PhList
            class="group-focus:text-accent-foreground"
            :class="{ 'text-primary-500 dark:text-primary-400': search.sortBy === 'id' }"
          />
          id
        </DropdownMenuItem>
        <DropdownMenuItem :class="itemClass" @click="setSortBy('created')">
          <ph-calendar
            class="group-focus:text-accent-foreground"
            :class="{ 'text-primary-500 dark:text-primary-400': search.sortBy === 'created' }"
          />
          creation date
        </DropdownMenuItem>
        <DropdownMenuItem :class="itemClass" @click="setSortBy('subreddit')">
          <div
            class="group-focus:text-accent-foreground"
            :class="{ 'text-mono min-w-5 font-bold text-primary-500 dark:text-primary-400': search.sortBy === 'subreddit' }"
          >
            r/
          </div>
          subreddit
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
