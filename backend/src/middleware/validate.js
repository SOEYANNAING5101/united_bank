const validate = (schemas) =>(req,res,next)=>{
    req.valid ={}
    for (const part of ['params','body','query']){
        if (!schemas[part]) continue;
        const result = schemas[part].safeParse(req[part]??{});
        if (!result.success){
            const issue =result.error.issues[0];
            const field = issue.path.join(".")
            return res.status(422).json({
                message: field ? `${field}: ${issue.message}`:issue.message,
            });
        }
        req.valid[part]= result.data; 
    }
    next();
}
module.exports = validate;