import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 회사 정보 */}
          <div>
            <h3 className="font-bold text-lg mb-3">SmartStock AI</h3>
          </div>

          {/* 링크 */}
          <div>
            <h4 className="font-semibold mb-3">서비스</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/help" className="hover:text-blue-600">
                  고객지원
                </Link>
              </li>
              <li>
                <Link to="/policy" className="hover:text-blue-600">
                  이용약관
                </Link>
              </li>
              <li>
                <Link to="/policy?tab=privacy" className="hover:text-blue-600">
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>

          {/* 연락처 */}
          <div>
            <h4 className="font-semibold mb-3">문의</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>이메일: support@smartstock.ai</li>
              <li>전화: 1588-0000</li>
              <li>운영시간: 평일 09:00 - 18:00</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-gray-500">
          © 2025 SmartStock AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}