import { random } from "lodash";

export enum MeituanOrderStatusCode {
  OCCUPY_SUCCESS = 102,
  OCCUPY_FAILED = 103,
  RELEASE_SUCCESS = 202,
  RELEASE_FAILED = 203,
  CONFIRMING = 301,
  CONFIRM_SUCCESS = 302,
  CONFIRM_FAILED = 303,
  PARTIAL_CONSUME_SUCCESS = 352,
  CANCELING = 401,
  PARTIAL_CANCEL_SUCCESS = 404,
  PARTIAL_CANCEL_FAILED = 405,
}


function removeFalsy(obj) {
  if (typeof obj === "object")
    return Object.entries(obj)
      .filter(([k, v]) => ![undefined, null, ""].includes(v))
      .reduce((r, [key, value]) => ({ ...r, [key]: removeFalsy(value) }), {});
  else return obj;
}

const server = Bun.serve({
  port: 8080,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname.endsWith("/heart")) {
      console.log(
        JSON.stringify({
          req: { method: req.method, path: url.pathname, headers: req.headers },
        })
      );
      return Response.json({
        msg: "alive",
      });
    }

    const requestBody = JSON.parse(decodeURIComponent(await req.text()));

    const decoded = Buffer.from(requestBody.data, "base64").toString("utf-8");
    const data = JSON.parse(decoded);
    console.log(
      JSON.stringify({
        req: { method: req.method, path: url.pathname, headers: req.headers },
        reqData: removeFalsy(data),
      })
    );

    switch (url.pathname.replace("/sandbox", "").replace("/online", "")) {
      case "/occupy":
        return Response.json({
          msg: "成功!",
          code: 200,
          orderId: data.orderId,
          success: true,
          otaOrderId: random(1, 100000000),
          isSuccess: true,
          otaOrderStatus: MeituanOrderStatusCode.OCCUPY_FAILED,
        });
      case "/release":
        return Response.json({
          msg: "成功!",
          code: 200,
          orderId: data.orderId,
          success: true,
          otaOrderId: data.otaOrderId,
          isSuccess: true,
          otaOrderStatus: MeituanOrderStatusCode.RELEASE_SUCCESS,
        });
      case "/confirm":
        return Response.json({
          msg: "成功!",
          code: 200,
          voucherItems: [
            {
              voucher: "123",
              voucherType: 3,
              voucherId: random(1, 100000000),
            },
          ],
          orderId: data.orderId,
          success: true,
          canConsumeTime: 0,
          otaOrderId: data.otaOrderId,
          isSuccess: true,
          otaOrderStatus: MeituanOrderStatusCode.CONFIRM_SUCCESS,
        });
      case "/cancel":
        return Response.json({
          msg: "取消成功",
          refundAmout: 0,
          code: 200,
          orderId: data.orderId,
          success: true,
          refundStatus: 0,
          canRefund: 1,
          otaOrderId: data.otaOrderId,
          refundId: data.refundId,
          isSuccess: true,
          otaOrderStatus: MeituanOrderStatusCode.PARTIAL_CANCEL_SUCCESS,
        });
      case "/queryOrder":
        return Response.json({
          msg: "已确认",
          code: 200,
          orderId: data.orderId,
          otaOrderId: data.otaOrderId,
          isSuccess: true,
          otaOrderStatus: MeituanOrderStatusCode.CONFIRM_SUCCESS,
        });
      case "/queryConsumeOrder":
        return Response.json({
          msg: "成功",
          code: 200,
          orderId: data.orderId,
          otaOrderId: data.otaOrderId,
          isSuccess: true,
          otaOrderStatus: MeituanOrderStatusCode.PARTIAL_CONSUME_SUCCESS,
        });
      case "/queryRefund":
        return Response.json({
          msg: "",
          code: 200,
          orderId: data.orderId,
          otaOrderId: data.otaOrderId,
          refundId: data.refundId,
          isSuccess: true,
          otaOrderStatus: MeituanOrderStatusCode.PARTIAL_CANCEL_SUCCESS,
        });
      default:
        // Handle other requests
        return new Response("Not found", { status: 404 });
    }
  },
});

console.log(`Listening on http://localhost:${server.port} ...`);
