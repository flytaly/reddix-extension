<script setup lang="ts">
import { RoutePath } from '~/options/routes'
import SearchHelp from '~/components/help/SearchHelp.vue'

function getUrl(path: string) {
  return browser.runtime.getURL(path)
}
</script>

<template>
  <MainLayout>
    <div class="mx-auto flex w-full max-w-[120ch] flex-col">
      <Card class="mt-2 w-full">
        <template #title>Help</template>
        <template #content>
          <Accordion :multiple="true" :active-index="[0]" class="text-sm">
            <AccordionTab header="About the extension">
              <p>
                The extension allows you to store your saved/upvoted posts and comments from Reddit in your browser's
                storage, so you can quickly access them and perform a quick incremental search.
              </p>
            </AccordionTab>
            <AccordionTab header="Fetching data">
              <p>
                To fetch saved posts, first make sure you are logged in to Reddit. Next, go to the search page and in
                input box click on login icon (or type your username manually).

                <img :src="getUrl('/assets/login.webp')" class="my-2 rounded-md" />

                Once you have done this, click "Get new saved items" and wait for the synchronization to complete. To
                fetch the upvoted posts, open the menu by clicking on the caret symbol and select "Get upvoted posts".

                <img :src="getUrl('/assets/fetch-opts.webp')" class="my-2 rounded-md" />

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
              The Reddit API
              <a href="https://www.reddit.com/r/TheoryOfReddit/comments/rfo7bt/comment/hoiqtpy/">
                does not allow you to fetch more than 1,000 items</a
              >, and it also does not provide information about upvoted comments. However, if you need them, you can get
              your data from
              <a href="https://www.reddit.com/settings/data-request">reddit.com/settings/data-request</a>. Submit a
              request there with "I want data from my full time at Reddit" option and wait untill Reddit sends you the
              data on your email. The data will be in the form of a ZIP archive containing various files. Once you have
              extracted the files, you can import them on the
              <router-link :to="RoutePath.Import">Import</router-link> page.
              <br />
              The extension supports following files:
              <div class="ml-4 grid grid-cols-[auto,1fr] gap-x-4">
                <b>saved_comments.csv</b>
                <span>should contain <i>id</i> and <i>permalink</i> columns</span>
                <b>saved_posts.csv</b>
                <span>should contain <i>id</i> and <i>permalink</i> columns</span>
                <b>comment_votes.csv</b>
                <span>should contain <i>id</i>, <i>permalink</i> and <i>direction</i> columns</span>
                <b>post_votes.csv</b>
                <span>should contain <i>id</i>, <i>permalink</i> and <i>direction</i> columns</span>
              </div>
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