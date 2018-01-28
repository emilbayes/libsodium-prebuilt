#include <nan.h>
#include <sodium.h>

NAN_METHOD(randombytes_random) {
  info.GetReturnValue().Set(Nan::New(randombytes_random()));
}

NAN_MODULE_INIT(InitAll) {
  if (sodium_init() == -1) {
    Nan::ThrowError("sodium_init() failed");
    return;
  }

  Nan::Set(target, Nan::New("randombytes_random").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(randombytes_random)).ToLocalChecked());
}

NODE_MODULE(sodium, InitAll)
