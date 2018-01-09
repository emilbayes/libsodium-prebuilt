#include <nan.h>
#include <sodium.h>

NAN_MODULE_INIT(InitAll) {
  if (sodium_init() == -1) {
    Nan::ThrowError("sodium_init() failed");
    return;
  }
}

NODE_MODULE(libsodium, InitAll)
