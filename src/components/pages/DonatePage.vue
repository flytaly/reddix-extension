<script setup lang="ts">
import BtcQR from '~/assets/crypto/btc.svg?component'
import DogeQR from '~/assets/crypto/doge.svg?component'
import EthQR from '~/assets/crypto/eth.svg?component'
import LtcQR from '~/assets/crypto/ltc.svg?component'
import SolQR from '~/assets/crypto/sol.svg?component'
import XlmQR from '~/assets/crypto/xlm.svg?component'
import DonateAddress from '~/components/DonateAddress.vue'

const addresses = [
  { name: 'Bitcoin (BTC)', address: 'bc1q6w68rerfyy7ex45fjwhwfe36zs5qjvwwl3xgz5', QRCode: BtcQR },
  { name: 'Ethereum (ETH)', address: '0xE36CeaEa3Da6f24A629450b927cd380973E72DD9', QRCode: EthQR },
  { name: 'Litecoin (LTC)', address: 'LTzrVCTUobG7XmDAjMYdRbAF22oArZGoVZ', QRCode: LtcQR },
  { name: 'Solana', address: 'ArfcBJfZE8UERucen9W9UfjX2D2yV2TctAnD6ovrQzKQ', QRCode: SolQR },
  { name: 'Doge', address: 'DGyddoAuhfnHfF3qxpv9Zsrt3H399i4Rxe', QRCode: DogeQR },
  {
    name: 'Stellar (XLM)',
    address: 'GCWW6CLB2L3H5SYDSKFG2PWNISLRQDILZXPXTVU64VV5WAKFPMOINMNF',
    QRCode: XlmQR,
  },
]
</script>

<template>
  <MainLayout>
    <div class="mx-auto flex w-full max-w-screen-md flex-col">
      <Card class="mt-2 w-full">
        <template #title>
          <h2 class="flex items-center font-sans text-base">
            <div class="flex items-center justify-center gap-2">
              <ph-hand-heart-duotone class="h-7 w-7 text-red-700 dark:text-red-400" />
              <span>Support the development and maintenance of the extension</span>
            </div>
          </h2>
        </template>
        <template #content>
          <main>
            <section>
              <h2 class="mb-4 text-lg font-bold">
                Crypto
              </h2>
              <div class="ml-8 space-y-8">
                <div>
                  <h3 class="mb-4 text-sm" data-l10n-id="donateNowPayments">
                    in any cryptocurrency via NOWPayments
                  </h3>
                  <a
                    href="https://nowpayments.io/donation/flytaly"
                    class="inline"
                    target="_blank"
                    title="nowpayments donation"
                    rel="noreferrer"
                  >
                    <img
                      class="h-16 w-auto"
                      src="https://nowpayments.io/images/embeds/donation-button-black.svg"
                      alt="Crypto donation button by NOWPayments"
                    >
                  </a>
                </div>
                <div>
                  <span class="mb-4 text-sm">or directly to the addresses</span>
                  <ul class="mt-2 grid grid-cols-2 gap-6">
                    <li v-for="address in addresses" :key="address.address">
                      <DonateAddress :address="address.address" :name="address.name">
                        <template #qr>
                          <component :is="address.QRCode" />
                        </template>
                      </DonateAddress>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </main>
        </template>
      </Card>
    </div>
  </MainLayout>
</template>
