<template lang='pug'>
div
  tk-hook(name="accueil" :data='{exemple: 1}' debug)
  span Accueil
  tk-hook(name="index.accueil.bottom")
  q-btn(@click='signIn()') signIn
  q-btn(@click='signOut()') signOut
  q-btn(@click='call()') call
</template>

<script lang='ts' setup>
definePageMeta({ auth: true })
// import { components } from '#nuxt-api-party/api'

// import { useApiFetch } from '../../../docs/useApiFetch.ts'

import { useApiFetch } from '~/composables/useApiFetch'

const { signIn, signOut, session, status, cookies, getProviders, user, sessionToken } = useAuth()
// type TicketCreateDto = components['_schemas']['TicketCreateDto']

const formData = {
  subject: 'toto'
}
try {
const { data } = await useApiData('tickets/ticket', {
  method: 'post',
  query: {
    aaaa: 1
  },
  body: {
    subject: 1
  },
  async onRequestError({ error }) {
    console.log(error)
  },
})
} catch (e) {
  console.log('e', e)
}

const call = async () => {
  // const { data } = await useApiData('tickets/ticket', {
  // })
  try {
    const { data } = await useApiFetch2('tickets/ticket', {
      method: 'post',
      cache: false,
      client: true,
      // query: {
      //   limit: 1
      // },
      // pathParams: {
      //   id: '1'
      // },
      body: {
        subjecet: "1"
      },
    }, {
      subject: 'aaa'
    })
  } catch (e) {
    console.log('e', e)
  }
  // console.log('test', data)
    // onRequest(context: FetchContext): Promise<void> | void {
    //   context.options.headers = {
    //     'Test': '1'
    //   }
    //   console.log('onRequest', context)
    // }
    //   method: 'get',
  //   // client: true,
  //   // headers: {
  //   //   'Test': '1'
  //   // },
  //   // body: formData,
  //   // watch: {
  //   //   onRequest: {
  //   //     handler: () => {
  //   //       console.log('onRequest')
  //   //     },
  //   //   }
  //   // }
  // })
  console.log('data', data)
}
</script>
