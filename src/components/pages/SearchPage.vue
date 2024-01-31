<script setup lang="ts">
import MainLayout from '~/components/pages/MainLayout.vue'
import SearchInput from '~/components/SearchInput.vue'
import Sidebar from '~/components/Sidebar.vue'
import ItemsContainer from '~/components/item/ItemsContainer.vue'
</script>

<template>
  <MainLayout>
    <main class="mt-4 bg-surface-50 text-dark sm:grid sm:grid-cols-[auto_1fr] dark:bg-surface-950 dark:text-light">
      <Sidebar />
      <div class="mx-auto my-4 flex w-full max-w-[80rem] flex-col items-center px-4 sm:my-0">
        <SearchInput />
        <div class="w-full">
          <ItemsContainer />
        </div>
      </div>
    </main>
  </MainLayout>
</template>

<style lang="postcss"></style>
