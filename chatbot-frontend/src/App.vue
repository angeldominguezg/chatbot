<template lang="pug">
  #app
    section.hero.is-light.is-fullheight(v-show="catchName")
      .hero-body
        .container.has-text-centered
          .column.is-4.is-offset-4
            .box
              figure.avatar.is-center
                img(style="max-width: 150px" src='./assets/weatherguru_icon.png')
                h3.m-b-10.title.has-text-info The Weather Guru
                //- p.has-text-info He knows when to use umbrella ☔️ or sunglasses 😎!
              div
                .field
                  .control
                    input(v-bind:class="{'is-danger': hasError}" @keyup.enter="initChat" class="input is-large" type='text', placeholder='Type your name to continue', autofocus='', v-model="username")
                    p.help.is-danger(v-show="hasError") The name is required
                a.button.is-block.is-info.is-large(v-on:click="initChat") Enter

    section.hero.is-light.is-fullheight(v-show="!catchName")
      .column.is-8.is-offset-2.m-t-10
          .box.content.chat
            .chat-header.clearfix
              img.image.is-64x64(src='./assets/weatherguru_icon.png', alt='avatar')
              .chat-about
                .chat-with The Weather Guru
                .chat-status.has-text-success.is-italic Online
            //- end chat-header
            .chat-history#chat-history( class="messages" v-chat-scroll="{always: true}")
              ul
                li(v-for="message in messages").clearfix
                  //- if for distinct the user message aling and separe
                  div(v-if="message.user == username")
                    .message-data
                      span.message-data-name {{ message.user }}
                    .message.my-message
                      | {{ message.message }}
                  div(v-else)
                    .message-data.align-right
                      span.message-data-name {{ message.user }}
                    .message.other-message.float-right
                      | {{ message.message }}
            //- end chat-history
            .chat-message.clearfix
                .field.has-addons
                  .control.is-expanded
                    input.input.is-medium(v-model="message",  @keyup.enter="sendMessage", type="text", placeholder="Type your message")
                  .control
                    button#message-to-send.button.is-medium.is-info(v-on:click="sendMessage") Send
</template>

<script>
import Vue from 'vue'
import VueSocketio from 'vue-socket.io'
import VueLocalStorage from 'vue-ls'

import VueChatScroll from 'vue-chat-scroll'
Vue.use(VueChatScroll)

let options = {
  namespace: 'weatherguru__'
}
Vue.use(VueLocalStorage, options)

// TODO: url to PROCESS.ENV
Vue.use(VueSocketio, 'http://localhost:3000?token='+Vue.ls.get('token'))

export default {
  name: 'app',
  
  data () {
    return {
      username: null,
      hasError: false,
      catchName: true,
      // Chat
      message: '',
      messages: [],
    }
  },
  sockets:{
    connect: function () {
      // pasar el token
      console.log('socket connected', Vue.ls.get('token'))
    },
    set_user_emit: function (data) {
      console.log('Server response for setUser', data)
      // set local token for load conversation
      if (!Vue.ls.get('token')) {
        Vue.ls.set('token', data.token)
      }
      // Subscribe the room
      console.log('subcribe room', Vue.ls.get('token'))
      this.$socket.emit('subscribe', Vue.ls.get('token'));
    },
    messageEmit: function (data) {
      this.messages.push(data)
    }
  },
  methods: {
    initChat:function () {
        // Username validation
        if(!this.username) {
          this.hasError = true
          return
        }
        this.hasError = false
        this.catchName = false
        let payload = {
          username: this.username,
          token: Vue.ls.get('token')
        }
        this.$socket.emit('set_user', payload)
    },
    sendMessage: function (e) {
      if (e.keyCode === 13 || e.type === 'click') {
        if(this.message !== ''){
          let payload = {
            username: this.username,
            message: this.message
          }
          this.$socket.emit('new_message', payload)
        }
      }
      this.message = ''
    }
  }
}
</script>

<style lang="scss">
@import './scss/main.scss';
</style>
