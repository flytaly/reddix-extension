<script setup lang="ts">
const eg = h('span', { class: 'font-mono text-primary-700 dark:text-primary-500' })
</script>

<template>
  <article>
    <div class="mb-1 font-bold">Keywords</div>
    <p>Use the following prefixes to filter search results:</p>
    <div class="grid grid-cols-[auto,1fr] gap-x-4">
      <div><eg>author:</eg> or <eg>u/</eg></div>
      <div>post or comment author (e.g. <eg>u/reddituser</eg> or <eg>author:reddituser</eg>)</div>
      <div><eg>title:</eg> or <eg>t:</eg></div>
      <div>a word in posts titles (e.g. <eg>title:chatgpt</eg> or <eg>t:chatgpt</eg>)</div>
      <div><eg>body:</eg> or <eg>b:</eg></div>
      <div>a word in posts/comments text (e.g. <eg>body:chatgpt</eg> or <eg>b:chatgpt</eg>)</div>
      <div><eg>subreddit:</eg> or <eg>r/</eg></div>
      <div>a name of the subreddit (e.g. <eg>r/formula1</eg>)</div>
      <div><eg>#</eg></div>
      <div>your custom tag (e.g. <eg>#images</eg>)</div>
    </div>
    <div class="mb-1 mt-3 font-bold">Escaping</div>
    <p>
      Use the backslash <eg>\</eg> to escape the next keyword. For example, <eg>\r/ChatGPT</eg>, if you want to search
      for the word "r/ChatGPT" instead of the subreddit itself.
    </p>
    <p>
      By default, the search treats your input as a prefix. For instance, <eg>title:go</eg> will match all posts with
      titles that contain words that start with "go" such as "good", "got", "google", e.t.c. To prevent this, you can
      add a backslash at the end of your search term: <eg>title:go\</eg>.
    </p>
  </article>
</template>
