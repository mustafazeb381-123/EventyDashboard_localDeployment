import loginRIghtImage from "../assets/images/login_right_image.png";
import loginLeftImage from "../assets/images/login_left_image.png";
import eventyLoginLogo from "../assets/images/eventy_login_logo.png";

class AppAssets {
  readonly images = {
    loginRIghtImage: loginRIghtImage,
    loginLeftImage: loginLeftImage,
    eventyLoginLogo: eventyLoginLogo,

    // splash1: require('../assets/images/splash1.png'),
  } as const;

  readonly icons = {} as const;

  readonly temp = {
    // home: require('../assets/temp/home.png'),
  } as const;

  readonly svg = {} as const;
}

const Assets = new AppAssets();

export default Assets;
