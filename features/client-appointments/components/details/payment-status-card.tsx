"use client";

import { ClientAppointmentDetails } from "@/types/client-portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, FileText, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function PaymentStatusCard({ appointment }: { appointment: ClientAppointmentDetails }) {
  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid_online":
      case "paid_cash":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-none">Paid</Badge>;
      case "refunded":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-none">Refunded</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-none">Processing</Badge>;
      case "unpaid":
      default:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-none">Unpaid</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Payment Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center pb-3 border-b">
          <span className="text-sm text-muted-foreground">Status</span>
          {getPaymentBadge(appointment.payment_status)}
        </div>
        <div className="flex justify-between items-center pb-3 border-b">
          <span className="text-sm text-muted-foreground">Amount</span>
          <span className="font-medium">$0.00</span> {/* Placeholder for actual amount if applicable */}
        </div>
        <div className="flex justify-between items-center pb-3 border-b">
          <span className="text-sm text-muted-foreground">Method</span>
          <span className="font-medium capitalize">{appointment.payment_status.replace("paid_", "") || "N/A"}</span>
        </div>
        
        <div className="pt-2 space-y-2">
          <Button variant="outline" className="w-full justify-start text-muted-foreground" disabled>
            <FileText className="h-4 w-4 mr-2" />
            View Invoice
          </Button>
          <Button variant="outline" className="w-full justify-start text-muted-foreground" disabled>
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
