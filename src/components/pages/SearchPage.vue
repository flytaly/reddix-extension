<script setup lang="ts">
import ItemsContainer from '~/components/item/ItemsContainer.vue'
import MainLayout from '~/components/pages/MainLayout.vue'
import Permissions from '~/components/Permissions.vue'
import SearchInput from '~/components/SearchInput.vue'
import Sidebar from '~/components/SearchSidebar.vue'
</script>

<template>
  <MainLayout>
    <main class="md:grid mt-4 grow bg-surface-50 text-dark dark:bg-surface-950 dark:text-light">
      <div class="sidebar">
        <Sidebar />
      </div>
      <div class="input mx-auto mt-4 flex w-full max-w-main-column flex-col items-center px-4 sm:my-0">
        <Permissions />
        <SearchInput />
      </div>
      <div class="items mx-auto w-full">
        <ItemsContainer />
      </div>
    </main>
  </MainLayout>
</template>

<style lang="postcss" scoped>
main {
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    'side input'
    'side items';
}
.sidebar {
  grid-area: side;
}
.input {
  grid-area: input;
}
.items {
  grid-area: items;
}
</style>
