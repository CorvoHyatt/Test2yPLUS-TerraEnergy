namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class PredictionController extends Controller
{
    public function predict(Request $request)
    {
        $request->validate([
            'predictionPeriod' => 'required|integer|min:1',
            'startDate' => 'nullable|date',
            'endDate' => 'nullable|date'
        ]);

        $predictionPeriod = $request->input('predictionPeriod', 7);
        $startDate = $request->input('startDate') ? Carbon::parse($request->input('startDate')) : Carbon::now();
        $endDate = $request->input('endDate') ? Carbon::parse($request->input('endDate')) : $startDate->copy()->addDays($predictionPeriod);

        try {
            $response = Http::post(env('ML_SERVICE_URL') . '/predict', [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'prediction_days' => $predictionPeriod
            ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'error' => 'Error al obtener predicciones del servicio ML'
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error en la comunicación con el servicio de predicción: ' . $e->getMessage()
            ], 500);
        }
    }
}