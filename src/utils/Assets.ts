/* eslint-disable global-require */
class AppAssets {
  readonly images = {
    // splash1: require('../assets/images/splash1.png'),
    
  } as const;

  readonly temp = {
    // home: require('../assets/temp/home.png'),
    
  } as const;

  readonly svg = {} as const;
}

const Assets = new AppAssets();

export default Assets;
