<script setup lang="ts">
import Logo from '~/assets/logo_long.svg?component'
import ImportHelp from '~/components/help/ImportHelp.vue'
import SearchHelp from '~/components/help/SearchHelp.vue'

function getUrl(path: string) {
  return browser.runtime.getURL(path)
}
</script>

<template>
  <MainLayout>
    <div class="mx-auto flex w-full max-w-[120ch] flex-col">
      <Card class="mt-2">
        <template #title>
          About
        </template>
        <template #content>
          <article class="grid grid-cols-[auto,1fr] items-start justify-start gap-2">
            <Logo class="h-28 w-auto shrink-0" />
            <div class="flex h-full flex-col gap-2 text-sm">
              <header class="text-base">
                <b>Reddix </b><span class="text-sm">v.{{ $app.version }}</span>
              </header>
              <div class="flex-grow">
                Store your saved/upvoted posts and comments from Reddit in your browser's storage, so you can quickly
                access them and perform a quick incremental search.
              </div>
              <div class="mt-auto">
                <a
                  class="flex items-center gap-0.5 no-underline"
                  href="https://github.com/flytaly/reddix-extension"
                  target="_blank"
                >
                  <ph-github-logo class="h-5 w-5" />
                  GitHub
                </a>
              </div>
            </div>
          </article>
        </template>
      </Card>
      <Card class="mt-2" pt:content:class="!pt-0" :pt-options="{ mergeProps: true }">
        <template #title>
          Help
        </template>
        <template #content>
          <Accordion :multiple="true" class="text-sm">
            <AccordionTab header="Fetching data">
              <p>
                To fetch saved posts, first make sure you are logged in to Reddit. Next, go to the search page and in
                input box click on login icon (or type your username manually).

                <img :src="getUrl('/assets/login.webp')" class="my-2 rounded-md">

                Once you have done this, click "Get new saved items" and wait for the synchronization to complete. To
                fetch the upvoted posts, open the menu by clicking on the caret symbol and select "Get upvoted posts".

                <img :src="getUrl('/assets/fetch-opts.webp')" class="my-2 rounded-md">

                To keep your extension data up-to-date with Reddit, you can enable automatic updates on the Settings
                page.
              </p>
              <b>Limitations</b>
              <ul class="pl-4">
                <li>
                  <a href="https://www.reddit.com/r/TheoryOfReddit/comments/rfo7bt/comment/hoiqtpy/">
                    You can't fetch more than 1000 items.
                  </a>
                </li>
                <li>You can not fetch upvoted comments.</li>
              </ul>
              To bypass these restrictions, read the next section.
            </AccordionTab>
            <AccordionTab header="Importing data">
              <ImportHelp />
            </AccordionTab>
            <AccordionTab header="Search">
              <SearchHelp />
            </AccordionTab>
          </Accordion>
        </template>
      </Card>
    </div>
  </MainLayout>
</template>

<style lang="postcss" scoped>
a {
  text-decoration: underline;
}
</style>
