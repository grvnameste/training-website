import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      student_id,
      capstone_id,
      file_base64,
      file_name
    } = body

    // ✅ 1. upload to storage
    const buffer = Buffer.from(file_base64, 'base64')

    const filePath = `${capstone_id}/${student_id}/${Date.now()}-${file_name}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('capstone-requirements')
      .upload(filePath, buffer, {
        contentType: 'application/pdf'
      })

    if (uploadError) {
      return Response.json({ error: uploadError.message }, { status: 400 })
    }

    // ✅ 2. get public URL
    const { data } = supabaseAdmin.storage
      .from('capstone-requirements')
      .getPublicUrl(filePath)

    const file_url = data.publicUrl

    // ✅ 3. insert into requirement_documents
    const { error: dbError } = await supabaseAdmin
      .from('requirement_documents')
      .upsert({
        student_id,
        capstone_id,
        file_url,
        approved: false
      }, {
        onConflict: 'student_id,capstone_id'
      })

    if (dbError) {
      return Response.json({ error: dbError.message }, { status: 400 })
    }

    // ✅ 4. update progress
    await supabaseAdmin
      .from('student_capstone_progress')
      .update({
        stage1_submit: true
      })
      .eq('student_id', student_id)
      .eq('capstone_id', capstone_id)

    return Response.json({ success: true })

  } catch (err) {
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}