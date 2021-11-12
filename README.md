# Wanna Hang Out (server)

We use Heroku to deploy our server, you can [access the api here](https://iei-lab-server.herokuapp.com)

## Installation
  #### MacOS
First install nvm ([MacOS](https://github.com/nvm-sh/nvm#installing-and-updating))

  #### Linux (debian)
Download & Install nvm
``` bash
$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash
```

Configuration nvm
``` bash
$ export NVM_DIR="$HOME/.nvm" 
$ [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
$ [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

### Use node 14.17.3

``` bash
$ nvm install 14.17.3
$ nvm use 14.17.3
```

### Use yarn

``` bash
$ npm i -g yarn
```

### Build Setup

``` bash
# install dependencies
$ yarn

# serve with hot reload at localhost:3000
$ yarn run dev

# serve as production with hot reload at localhost:3000
# $ yarn run start

```

### Code styling

``` bash
# check code styling errors and warnings
$ yarn run lint

# fix potentially fixable errors automatically
$ yarn run lint --fix

```
