import hashlib
import hmac
import urllib.parse
from django.conf import settings


class Vnpay:
    def __init__(self):
        self.request_data = {}
        self.response_data = {}

    def get_payment_url(self):
        input_data = sorted(self.request_data.items())
        query_string = ""
        i = 0
        for key, val in input_data:
            if i == 1:
                query_string += "&" + key + '=' + urllib.parse.quote_plus(str(val))
            else:
                i = 1
                query_string = key + '=' + urllib.parse.quote_plus(str(val))

        secret_key_bytes = settings.VNPAY_HASH_SECRET_KEY.encode()
        query_string_bytes = query_string.encode()
        secure_hash = hmac.new(secret_key_bytes, query_string_bytes, hashlib.sha512).hexdigest()

        return f"{settings.VNPAY_ENDPOINT}?{query_string}&vnp_SecureHash={secure_hash}"

    def validate_response(self, response_data):
        vnp_secure_hash = response_data.get('vnp_SecureHash', None)
        if not vnp_secure_hash:
            return False

        if 'vnp_SecureHash' in response_data:
            del response_data['vnp_SecureHash']
        if 'vnp_SecureHashType' in response_data:
            del response_data['vnp_SecureHashType']

        input_data = sorted(response_data.items())

        query_string = ""
        i = 0
        for key, val in input_data:
            if i == 1:
                query_string += "&" + key + '=' + urllib.parse.quote_plus(str(val))
            else:
                i = 1
                query_string = key + '=' + urllib.parse.quote_plus(str(val))

        secret_key_bytes = settings.VNPAY_HASH_SECRET_KEY.encode()
        query_string_bytes = query_string.encode()
        generated_hash = hmac.new(secret_key_bytes, query_string_bytes, hashlib.sha512).hexdigest()

        return generated_hash == vnp_secure_hash

